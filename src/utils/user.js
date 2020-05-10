const users = []

//addUser, removeUser, getUser, getUsersinRoom

const addUser = ( { id, username, room }) => {

    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    //validate data
    if( !username || !room ) {
        return {
            error: 'Username and room are required!'
        }
    }

    // name must be unique, check for existing users
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }
    // store user
    const user = { id, username, room }
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    // const index = users.findIndex(() => { 
    //     return user.id === id               
    // })
    // or use SHORT VERISON
    const index = users.findIndex((user) => user.id === id )

    if( index !== -1 ) {  // match found
        return users.splice(index, 1)[0]       // remove 1 item only
    }
}

const getUser = (id) => {
   // const index = users.findIndex((user) => user.id === id )
    //    return users[index]   
    return users.find((user) => user.id === id )
}

const getUsersInRoom = (roomid) => {
    return users.filter((user) => user.room === roomid )
 }

 module.exports={
     addUser,
     removeUser,
     getUser, 
     getUsersInRoom
 }

// addUser ({
//     id: 22,
//     username:'Andrew',
//     room:'Miami Lower'
// })
// addUser ({
//     id: 32,
//     username:'Andrew',
//     room:'Denver'
// })
// addUser ({
//     id: 42,
//     username:'Mike',
//     room:'Miami Lower'
// })

// console.log(users)

// const foundUser = getUser(22)
// console.log('foundUser:',foundUser)
// console.log(users)

// console.log('foundUsersByRoom:',getUsersInRoom('miami lower'))
