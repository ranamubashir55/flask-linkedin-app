from flask import Flask, session, redirect, url_for, escape, request, render_template, jsonify
import json,os,time
import random,string
from flask_socketio import SocketIO
from linkedin_api.linkedin import Linkedin
from flask_cors import CORS

app = Flask(__name__)

socketio = SocketIO(app)


# @app.route("/login", methods = ['GET', 'POST'])
# def login():
#     with open("config.json","r") as out_file:
#         config = json.loads(out_file.read())
#     if request.method == 'POST':
#         name = request.form['id']
#         password = request.form['password']
#         for user in config['users']:
#             if user["id"]==name and user["password"]==password:
#                 print(f"user {name} logged in successfully")
#                 app.secret_key = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(75))
#                 return {"message":"success", "key":app.secret_key}
#             return {"message":"invalid username or password"}


# def authorized(auth):
#     if auth == app.secret_key and not auth==None:
#         return True
#     else:
#         return {"message": "ERROR: Unauthorized"}

# Sending Message To Linked In connections

def send_message(data, api):
    # auth = authorized(data["key"])
    linkedin_ids = data.get("linkedInIDs")
    msg = data['message']
    if not linkedin_ids:
        print("Getting basic profile info....")
        # urn_id = api.get_profile()
        # urn_id = urn_id['entityUrn'].split(":")[-1]
        # connections = api.get_profile_connections(urn_id)
        all_connections=[]
        print("Getting profile connections...")
        count = 0
        numVisibleResults=0
        send_fail = []
        ceo=[]
        hr =[]
        tr_sale =[]
        broker = []
        while True:
            try:
                send_msgs_connection=[]
                connections = api.exclusive_get_request('https://www.linkedin.com/voyager/api/search/blended?count=49&filters=List(network-%3EF,resultType-%3EPEOPLE)&origin=MEMBER_PROFILE_CANNED_SEARCH&q=all&queryContext=List(spellCorrectionEnabled-%3Etrue)&start='+str(len(all_connections)))
                f_con = json.loads(connections)
                # print(f_con)
                total_results =f_con.get("metadata")
                numVisibleResults = total_results.get("numVisibleResults")
                print(f"Total profile connections is {total_results.get('totalResultCount')} and visible results is {numVisibleResults}")
                for dt in f_con.get('elements',[]):
                    con = dt.get('elements',[])
                    if con:
                        for x in con:
                            all_connections.append({"urn_id":x.get("targetUrn").split(":")[-1],"public_id":x.get("publicIdentifier")})
                            if ('ceo' in x['headline']['text'].lower() or 'chief executive officer' in x['headline']['text'].lower() or 'president' in x['headline']['text'].lower() or 'director' in x['headline']['text'].lower() or 'finance' in x['headline']['text'].lower() or 'manager' in x['headline']['text'].lower()) and data.get('selector')=='2':
                                send_msgs_connection.append({"urn_id":x.get("targetUrn").split(":")[-1],"public_id":x.get("publicIdentifier")})
                                ceo.append({"public_id":x.get("publicIdentifier")})
                                yield {"found_conn": len(all_connections) , "ceo":len(ceo)}

                            elif ('treasurer' in x['headline']['text'].lower() or 'sales' in x['headline']['text'].lower() or 'business administartion' in x['headline']['text'].lower() or 'executive' in x['headline']['text'].lower()) and data.get('selector')=='3':
                                send_msgs_connection.append({"urn_id":x.get("targetUrn").split(":")[-1],"public_id":x.get("publicIdentifier")})
                                tr_sale.append({"public_id":x.get("publicIdentifier")})
                                yield {"found_conn": len(all_connections) , "tr_sales":len(tr_sale)}
                                
                            elif ('hr' in x['headline']['text'].lower()) and data.get('selector')=='4':
                                send_msgs_connection.append({"urn_id":x.get("targetUrn").split(":")[-1],"public_id":x.get("publicIdentifier")})
                                hr.append({"public_id":x.get("publicIdentifier")})
                                yield {"found_conn": len(all_connections) , "hr":len(hr)}

                            elif ('broker' in x['headline']['text'].lower()) and data.get('selector')=='5':
                                send_msgs_connection.append({"urn_id":x.get("targetUrn").split(":")[-1],"public_id":x.get("publicIdentifier")})
                                broker.append({"public_id":x.get("publicIdentifier")})
                                yield {"found_conn": len(all_connections) , "broker":len(broker)}

                            elif data.get('selector')=='0':
                                send_msgs_connection.append({"urn_id":x.get("targetUrn").split(":")[-1],"public_id":x.get("publicIdentifier")})
                                yield {"found_conn": len(all_connections)}

                        print(f"connections grew to {len(all_connections)}")
                            
                for index, x in enumerate(send_msgs_connection):
                    print("Sending Msg to: ",x['public_id'])
                    urn_id = x['urn_id']
                    print(f"urn_id of {x['public_id']} is {urn_id}")
                    res = api.send_message(recipients=[urn_id], message_body=msg)
                    if res==False:
                        print("Msg sent to: ",x['public_id'])
                        count = count+1
                        if data.get('selector')=='0':
                            total = len(all_connections)
                            yield {"sent":count,"total":len(all_connections)}
                        elif data.get('selector')=='2':
                            total = len(ceo)
                            yield {"sent":count,"total":len(ceo)}
                        elif data.get('selector')=='3':
                            total = len(tr_sale)
                            yield {"sent":count,"total":len(tr_sale)}
                        elif data.get('selector')=='4':
                            total = len(hr)
                            yield {"sent":count,"total":len(hr)}
                        elif data.get('selector')=='5':
                            total = len(broker)
                            yield {"sent":count,"total":len(broker)}

                    else:
                        print("error sending msg to: ",x['public_id'])
                        send_fail.append(x['public_id'])
                send_msgs_connection=[]
                if numVisibleResults==0 or numVisibleResults==None:
                    print("breaaaaaaaaaaaaaaaaaaaaaaaaaaaaak")
                    break
            except Exception as ex:
                print(ex)

        print("Total connections found is ",len(all_connections))
        send = {"completed":True,"sent":count,"total":total, "found_conn": len(all_connections), "send_fail": send_fail}
        print(send)
        time.sleep(2)
        yield send

    if linkedin_ids:
        all_people = linkedin_ids
        yield {"found_conn": len(all_people)}
        count = 0
        send_fail = []
        for index, x in enumerate(all_people):
            print("Sending Msg to: ",x)
            try:
                urn_id = api.get_profile(x)
                urn_id = urn_id['entityUrn'].split(":")[-1]
                print(f"urn_id of {x} is {urn_id}")
                res = api.send_message(recipients=[urn_id], message_body=msg)
                if res==False:
                    print("Msg sent to: ",x)
                    count = index+1
                    yield {"sent":count,"total":len(all_people)}
                else:
                    print("error sending msg to: ",x)
                    send_fail.append(x)
            except Exception as ex:
                print("error on msg:: ", ex)
        time.sleep(2)
        yield {"completed":True,"sent":count,"total":len(all_people), "found_conn": len(all_people), "send_fail": send_fail}

@app.route("/")
def index():
    return render_template('index.html')
    
# @socketio.on('key')
# def key():
#     socketio.emit('key',{"key":app.secret_key})



@socketio.on('send_message')
def api(message):
    # socketio.emit('update', 'ssssssssssssssssssssssssssssssssssssssssscccccc')
    data = json.loads(message)
    print(data)
    api=''
    lnk_id = data['username']
    lnk_pass = data['password']
    try:
        print("logging in api")
        api = Linkedin(lnk_id, lnk_pass)
        print("logged in successfully")
    except Exception:
        print("Invalid linkedin_id or password")
        socketio.emit('update', {"error":"Invalid Linkedin Id or Password"})

    if api:
        for x in send_message(data, api):
            socketio.emit('update', x)


if __name__ =="__main__":
    socketio.run(app, host="0.0.0.0" , port=5000, debug=True)