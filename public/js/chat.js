const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username , room} = Qs.parse(location.search, { ignoreQueryPrefix : true } )
const autoscroll = () => {

    //New message element 
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled ? 
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message' , (message)=> {
    console.log(message)

    const html = Mustache.render(messageTemplate , {
        username : message.username ,
        message : message.text ,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage' , (url)=>{
    const html = Mustache.render(locationMessageTemplate , {
        username : url.username ,
        url : url.url ,
        createdAt : moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

socket.on('roomData' , ({room , users})=> {
    const html = Mustache.render(sidebarTemplate , {
        room ,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit' , (e)=> {
    e.preventDefault()

    //disabling buttons
    $messageFormButton.setAttribute('disabled' , 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage' , message , (error)=> {

        //enabling buttons
        $messageFormButton.removeAttribute('disabled')

        //clearing input after message send
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('The message was delivered !')
    })
})


$sendLocationButton.addEventListener('click' , ()=> {

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser .')
    }

    $sendLocationButton.setAttribute('disabled' , 'disabled')


    navigator.geolocation.getCurrentPosition(position => {
        const location = {
            latitude : position.coords.latitude ,
            longitude : position.coords.longitude 
        } 
        socket.emit('sendLocation' , location , (message)=> {
            
            $sendLocationButton.removeAttribute('disabled')

            console.log(message)
        })
    })
})


socket.emit('join' , { username , room } , (error)=> {
    if(error) {
        alert(error)
        location.href = '/'
    }
})
// socket.on('countUpdated' , (count)=> {
//     console.log('the count has been updated' , count)
// })
// document.querySelector('#increment').addEventListener('click' , ()=> {
//     console.log('clicked')
//     socket.emit('increment')
// })