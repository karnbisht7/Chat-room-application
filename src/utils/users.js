const users = []

//addUser , removeUser , getUser , getserInRoom

const addUser = ({id , username , room})=> {

    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room) {
        return {
            error : 'Username and room are required !'
        }
    }

    //check for existing user 
    const existingUser = users.find(user=> {
        return user.username === username && user.room === room
    })

    //Validate username
    if(existingUser){
        return {
            error :' Username is in use !'
        }
    }

    //store User 
    const user = { id , username , room}

    users.push(user)

    return {user}

}

const removeUser = (id)=> {
    const index = users.findIndex(user=> {
        return user.id === id
    })

    if(index !== -1) {
        return users.splice(index , 1)[0]
    }
}

const getUser = (id)=> {

    // .find method returns undefined if it doesnt find a match so we can directly return tha .find results
    return users.find(user=>  user.id === id )
}

const getUsersInRoom = (room)=> {
    room = room.trim().toLowerCase()
     return  users.filter(user => user.room === room )
}


module.exports = {
    addUser ,
    removeUser ,
    getUser ,
    getUsersInRoom
}