const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// ============================ Templates ====================================
const messageTemplate = document.querySelector('#message-template').innerHTML   // get access to the element
const locationTemplate = document.querySelector('#location-template').innerHTML   // get access to the element
const sidebarTemplate =  document.querySelector('#sidebar-template').innerHTML   

// ============================ Options ====================================\
// location.search   :    "?username=Name&room=22"
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true}) 
//console.log( 'from decompose',username, room )

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //console.log( newMessageMargin)
    //visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have I scrolled
    const scrollOffset = $messages.scrollTop   // amount of distance we scrolled from the top
                        + visibleHeight    

    if ( containerHeight - newMessageHeight <= scrollOffset ) {   // make sure we are at the bottom
        $messages.scrollTop = $messages.scrollHeight  // haw far down => all the way!
    }
}
//--------------------------------------------------------------------------------
socket.on('MessageFromServer', (fromserver) => {
    console.log(fromserver)
    //const html = Mustache.render(messageTemplate)
    const htmlInsert = Mustache.render( messageTemplate, {
        username: fromserver.username,
        message: fromserver.text,
        createdAt: moment( fromserver.createdAt ).format( 'h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', htmlInsert)
    autoscroll()
})  
//--------------------------------------------------------------------------------
socket.on('LocationFromServer', (fromserver) => {
    console.log(fromserver)
    
    const htmlInsert = Mustache.render( locationTemplate, {
        username: fromserver.username,
        locationPlaceholder: fromserver.url,
        createdAt: moment( fromserver.createdAt ).format( 'h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', htmlInsert)
    autoscroll()
})  
//--------------------------------------------------------------------------------
socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})  
//==============================================================================
// CHAT APP CODE
//document.querySelector('#message-form').addEventListener('submit', (e) => {
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()   // avoid full page refresh
    //disable the form during the processing
    $messageFormButton.setAttribute('disabled','disabled')

    //const message = document.querySelector('input').value   // using element type input (if unique)
    const message = e.target.elements.input1.value      // new way by element name
    socket.emit('sendMessageFromClient',message, (error) => {
        //enable form after processing is done
        $messageFormButton.removeAttribute('disabled')
        // clear input once message sent
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if(error){
            return console.log('Error')
        }
        console.log('message was delivered,')
    }) 
})

// Elements
const $locationButton = document.querySelector('#send-location')

//document.querySelector('#send-location').addEventListener('click', (e) => {
$locationButton.addEventListener('click', (e) => {
    e.preventDefault()
    
    if( !navigator.geolocation ) {
        return alert('Geolocation is not supported by your browser')
    }
    
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition( (position) => {
        //console.log('latitude',position.coords.latitude)
        //console.log('longitude',position.coords.longitude)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude }, (error) => {
                $locationButton.removeAttribute('disabled')
                
                if(error){
                    return console.log('Error')
                }
                console.log('Location shared')

        }) 
    })

})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    } 
 
   // console.log('from chat js: ',username, room)
})