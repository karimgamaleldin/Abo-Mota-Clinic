import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import { BsMicMute } from "react-icons/bs";
import { GoUnmute } from "react-icons/go";
import { HiOutlineVideoCameraSlash, HiOutlineVideoCamera } from "react-icons/hi2";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./VideoChat.css";
import { useSelector } from "react-redux";
import {
  useFetchDoctorsQuery,
  useFetchDoctorQuery,
  useFetchPatientQuery,
  useFetchPatientsQuery,
} from "../../../store";
import LoadingIndicator from "../../Components/LoadingIndicator";
import { useParams } from "react-router-dom";

const socket = io.connect("http://localhost:5000");
function VideoChat() {
  const user = useSelector((state) => state.user);
  // console.log(user);
  const {
    data: patientData,
    isFetching: patientIsFetching,
    error: patientError,
  } = useFetchPatientQuery();
  const {
    data: doctorsData,
    isFetching: doctorsIsFetching,
    error: doctorsError,
  } = useFetchDoctorsQuery();
  const {
    data: doctorData,
    isFetching: doctorIsFetching,
    error: doctorError,
  } = useFetchDoctorQuery();

  const {
    data: patientsData,
    isFetching: patientsIsFetching,
    error: patientsError,
  } = useFetchPatientsQuery();

  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [callerName, setCallerName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const [isMuted, setIsMuted] = useState(true);
  const [cameraOff, setCameraOff] = useState(true);

  const { id, idx } = useParams();

  const toggleMute = () => {
    if (stream) {
      const enabled = stream.getAudioTracks()[0].enabled;
      stream.getAudioTracks()[0].enabled = !enabled;
      setIsMuted(!enabled);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const enabled = stream.getVideoTracks()[0].enabled;
      stream.getVideoTracks()[0].enabled = !enabled;
      setCameraOff(!enabled);
    }
  };
  useEffect(() => {
    if (patientIsFetching || doctorsIsFetching || doctorIsFetching || patientsIsFetching) return;
    if (user.userRoleClinic === "patient") {
      setName(patientData.name);
      setCallerName(doctorsData[id].name);
      setIdToCall(doctorsData[id]._id);
    } else {
      setName(doctorData.name);
      setCallerName(patientsData[idx].name);
      setIdToCall(patientsData[idx]._id);
    }
  }, [patientIsFetching, doctorsIsFetching, doctorIsFetching, patientsIsFetching]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      // console.log(myVideo.current);
      // console.log(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("callEnded", () => {
      setCallEnded(true);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      console.log(data);
      console.log(caller);
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    socket.emit("callEnded");
    setCallEnded(true);
    // console.log(connectionRef.current);

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    socket.disconnect();
  };
  if (patientIsFetching || doctorsIsFetching || doctorIsFetching || patientsIsFetching)
    return <LoadingIndicator />;
  // if (patientError || doctorsError || doctorError || patientsError) {
  //   //console.log(patientData, doctorsData);
  //   return <div>Something went wrong</div>;
  // }

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Video Call</h1>
      <div className="container">
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            // onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          {/* <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy ID
            </Button>
          </CopyToClipboard> */}

          <TextField
            id="filled-basic"
            label={user.userRoleClinic === "doctor" ? "Patient to call" : "Doctor to Call"}
            variant="filled"
            value={callerName}
            // onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {callerName}
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
        <div className="video-container">
          <div className="my-video">
            {stream && (
              <div>
                <video
                  className="video-player"
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  style={{ width: "200px" }}
                />
                <Button variant="outlined" color="primary" onClick={toggleMute}>
                  {isMuted ? <GoUnmute /> : <BsMicMute />}
                </Button>
                <Button variant="outlined" color="secondary" onClick={toggleCamera}>
                  {cameraOff ? <HiOutlineVideoCamera /> : <HiOutlineVideoCameraSlash />}
                </Button>
              </div>
            )}
          </div>
          <div className="other-video">
            {callAccepted && !callEnded ? (
              <video
                className="video-player"
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "100%" }}
              />
            ) : (
              <div className="no-call-placeholder">Waiting</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoChat;
