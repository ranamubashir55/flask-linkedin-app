
(function ($) {
    "use strict";

    /*==================================================================
    [ Focus Contact2 ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })

    /*==================================================================
    [ Validate ]*/

    $('.validate-form').on('submit',function(e){
        var input = $('.validate-input .input100');
        var check = true;
        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }
        e.preventDefault();
            // get all the inputs into an array.
            var $inputs = $('.validate-form :input');
            // not sure if you wanted this, but I thought I'd add it.
            // get an associative array of just the values.
            var values = {};
            $inputs.each(function() {
                    values[this.name] = $(this).val();
            });
            if(values.linkedInIDs){
                var separators = [' ', '\\\+', '\\\(', '\\\)', '\\*', '/', ':', '\\\?', ',', '\\r\\n'],
                allLinkedInIds = values.linkedInIDs.split(new RegExp(separators.join('|'), 'g'));
                values.linkedInIDs = allLinkedInIds;
            } else {
                values["linkedInIDs"] = [];
            }
        if(check){
            linkedInMessageCall(values);
        }
        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    /*==================================================================
    [ Show / hide InputFields ]*/
    $('.custom-radio input[type=radio]').click(function(){
       var val = $(this).val();
       if(val == 1){
           var ele = $('.more-people');
           if(!$(ele).hasClass('exist')){
               $(ele).addClass('exist');
               var html = ` <div class="wrap-input100 validate-input" data-validate = "Atleast one LinkedIn Id Required">
               <span class="label-input100">LinkedIn User ID/IDs</span>
               <textarea class="input100" name="linkedInIDs" placeholder="Enter Id or List of Id e.g abc,xyz,stu"></textarea>
               <span class="focus-input100"></span>
           </div>`;
                $(ele).append(html);
           }
       } else {
        $('.more-people').empty().removeClass('exist');
       }
    });
    /*==================================================================
    [ Show / hide Form ]*/
    
    // $('.contact100-btn-hide').on('click', function(){
    //     $('.wrap-contact100').fadeOut(400);
    // })

    // $('.contact100-btn-show').on('click', function(){
    //     $('.wrap-contact100').fadeIn(400);
    // })
    $("input[type='radio']").click(function(){
        $("input[name='selector']").removeAttr('checked');
        $(this).attr('checked', 'checked');
    });
})(jQuery);

function linkedInMessageCall(data){
    var default_ceo = '';
    $('.validate-form').trigger("reset");
    $('.more-people').empty().removeClass('exist');
    var selector = $("input[name='selector']:checked").val();
    
    if(data.category){
        selector = data.category
    }

    if(selector == 2){
        default_ceo = "0 CEO found yet"
    }
    else if(selector ==3){
        default_ceo = "0 Treasurer found yet"
    }
    else if(selector ==4){
        default_ceo = "0 HR found yet"
    }
    else if(selector ==5){
        default_ceo = "0 Broker found yet"
    }
    var formData = {
        "username": data.username,
        "password": data.password,
        "linkedInIDs": data.linkedInIDs,
        "message": data.message,
        "selector": selector,
    };
    // console.log(formData)
    Swal.fire({
        title: '<i class="fa fa-linkedin"></i> Sending Messages',
        html: `
        <p class=" info-msg p-1">This may take a while please wait till the process ends</p>
        <p class="total_connections p-1">Connections found</p>
        <div class="no-ceo">${default_ceo}</div>
        <div class="linkedIn-alert-loading"><div class="loader"></div></div>
        <div class="msg-counter">0 of 0 messages sent</div>
        <div class="failed-msg mt-1"></div>`,
        type: null,
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
        showLoaderOnConfirm: false,
        showCloseButton: true,
        customClass: 'linkedIn-alert',
        onOpen: () => {
            $.ajax({
                url: '/sendMessage',
                type: "POST",
                data:formData,
                success: function(data) {
                    $('.msg-counter').html(data);
                },
                error: function() {
                   
                }
              });
            }
    });
}

