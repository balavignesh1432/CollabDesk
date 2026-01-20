import React, { useEffect,useRef,useState } from 'react';
import {io} from 'socket.io-client';

//Material UI
import { Avatar, List, ListItem, ListItemText, Paper, Typography,Dialog, DialogContent, DialogActions,DialogTitle,Button, Divider,useTheme,useMediaQuery,TextField,IconButton } from "@material-ui/core";
import {Person,Email,Send} from '@material-ui/icons';

//Redux
import { useSelector,useDispatch } from "react-redux";
import { getroomUser, getUser } from '../redux/actions';
import Chat from './Chat';


function Team(){

    const server='http://localhost:4000';
    const socket = useRef();

    const theme=useTheme();
    const isMobile=useMediaQuery(theme.breakpoints.down("sm"));

    const [open,setOpen]=useState(false);

    const [members,setMembers]= useState([]);
    const [userDetails,setUserDetails]=useState([]);
    
    const [name,setName]=useState('');
    const [contact,setContact]=useState('');
    const [message,setMessage]=useState('');

    const room = useSelector((state)=>state.roomReducer);
    const rooms= useSelector((state)=>state.roomUserReducer);
    const users = useSelector((state)=>state.userReducer);
    const username= useSelector((state)=>state.usernameReducer);

    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch({type:"RESET_MESSAGE"});
    },[dispatch]);
    
    useEffect(()=>{
        socket.current = io(server);
        socket.current.emit('join',{room:room});
        return ()=>{    
            socket.current.close();
        }
    },[room]);

    useEffect(()=>{
        socket.current.on('update',(data)=>{
            // console.log(data);
            dispatch({type:"SET_MESSAGE",payload:{username:data.username,message:data.message,time:data.time}});
        });
    },[socket,dispatch]);

    useEffect(()=>{
        dispatch(getroomUser());
        dispatch(getUser());
    },[dispatch]);

    useEffect(()=>{
        setUserDetails(users);
    },[users]);
    
    useEffect(()=>{
        for(let i=0;i<rooms.length;i++){
            if(rooms[i].room===room){   
                setMembers(rooms[i].users);
                break;
            }
        } 
    },[rooms,room]);

    function handleUserDetails(username){
        for(let i=0;i<userDetails.length;i++){
            if(userDetails[i].username===username){
                setName(userDetails[i].name);
                setContact(userDetails[i].email);
                break;
            }
        }
        setOpen(true);   
    }

    function handleDialogClose(){
        setOpen(false);
        setName('');
        setContact('');
    }

    function handleMessage(){
        const currentDate = new Date();
        const time=currentDate.getHours()+":"+currentDate.getMinutes();
        socket.current.emit('chat',{room,username,message,time});
        setMessage('');
    }
    return (
        <div style={!isMobile?{display:"flex",marginTop:"60px",justifyContent:"space-evenly",alignItems:"flex-start"}:{display:"flex",flexDirection:"column",alignItems:"center"}}>
        <Paper elevation={10} style={!isMobile?{width:"30%",background:"#F0F0F0"}:{width:"90%",background:"#F0F0F0"}}>
        <Typography variant={!isMobile?"h4":"h5"} style={{margin:"10px 0 10px 0"}}>Team Members</Typography>
        <div className="teamList">
        <List>
            {members.map((user,index)=>{
                return (
                    <div key={index}>
                    <ListItem button onClick={()=>handleUserDetails(user)}>
                        <Avatar style={{backgroundColor:"red",marginRight:"20px"}}>{user[0]}</Avatar>
                        <ListItemText primary={user} />
                    </ListItem>
                    </div>
                );
            })}
        </List>
        </div>
        </Paper>
        <Paper elevation={10} style={!isMobile?{width:"50%",background:"#F0F0F0"}:{width:"90%",background:"#F0F0F0",marginTop:"20px"}}>
            <Typography variant='h4' style={{marginTop:"10px"}}>Chatroom</Typography>
            <Chat />
            <div style={{display:"flex",width:"100%",alignItems:"flex-end"}}>
            <TextField  multiline placeholder="Type your message here..." rowsMax={4} value={message} style={{flex:"1",margin:"0 0 10px 20px"}} onChange={(event)=>setMessage(event.target.value)}/>
            <IconButton onClick={handleMessage}><Send fontSize="large" /></IconButton>
            </div>
        </Paper>
        <Dialog open={open} onClose={handleDialogClose}>
                    <DialogTitle>Member Details</DialogTitle>
                    <DialogContent>
                        <List style={{width:"300px"}}>
                            <ListItem >
                                <Person fontSize="large" style={{marginRight:"20px"}} />
                                <ListItemText primary="Name" secondary={name} />
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <Email fontSize="large" style={{marginRight:"20px"}} />
                                <ListItemText primary="Email" secondary={contact} />
                            </ListItem>
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" variant="contained" onClick={handleDialogClose}>Close</Button>
                    </DialogActions>
                </Dialog>
        </div>
    );
}

export default Team;