const baseUrl = 'http://127.0.0.1';
$('document').ready(function () {
  var socket = io.connect(baseUrl+":8082");
  socket.on('connect', function(data){
  })
  socket.emit('verify');
  socket.on('status', function (data) {
    // console.log(data);
    if(data.count.found_conn){
      $('.total_connections').html(data.count.found_conn + ' Connections found')
    }
    if(data.count.send_fail && data.count.send_fail.length > 0){
      $('.failed-msg').empty();
      $('.failed-msg').append('<p class="font-heavy">List of Ids to which message send failed</p>');
      for (let i = 0; i < data.count.send_fail.length; i++) {
          $('.failed-msg').append('<span>'+data.count.send_fail[i]+'</span><br>');
      }
    }
    if(typeof data.count.error && data.count.error != ''){
        $('.linkedIn-alert-loading, .info-msg').hide();
        $('.msg-counter').addClass('completed');
        $('.msg-counter').html(data.count.error).addClass('error');
    }
    else if(typeof data.count.completed && data.count.completed){
      $('.linkedIn-alert-loading, .info-msg').hide();
      $('.msg-counter').addClass('completed');
      $('.msg-counter').html(data.count.sent + ' of ' + data.count.total + ' messages sent')
    } else {
    $('.msg-counter').html(data.count.sent + ' of ' + data.count.total + ' messages sent')
    }
    if(typeof data.count.ceo && data.count.ceo !=""){
      $('.no-ceo').html(data.count.ceo + ' CEO found yet')
    }
    if(typeof data.count.tr_sales && data.count.tr_sales !=""){
      $('.no-ceo').html(data.count.tr_sales + ' Treasurer found yet')
    }
    if(typeof data.count.hr && data.count.hr !=""){
      $('.no-ceo').html(data.count.hr + ' HR found yet')
    }
    if(typeof data.count.broker && data.count.broker !=""){
      $('.no-ceo').html(data.count.broker + ' Broker found yet')
    }
  });
});