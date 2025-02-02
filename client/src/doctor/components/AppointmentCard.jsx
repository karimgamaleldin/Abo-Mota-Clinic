import * as React from "react";
import IconButton from "@mui/joy/IconButton";
import { BiCalendarX } from "react-icons/bi";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import MarkunreadIcon from "@mui/icons-material/Markunread";
import Divider from "@mui/joy/Divider";
import Chip from "@mui/joy/Chip";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useSendNotificationMutation, useCancelAppointmentMutation } from "../../store";
import TwoButtonModal from "../../shared/Components/TwoButtonModal";
import RescheduleAppointment from "./RescheduleAppointment";
import { useSendEmailMutation } from "../../store/apis/commonApi";
import { Tooltip } from "antd";

export default function AppointmentCard({ appointment, socket }) {
  const navigate = useNavigate(); // Hook to get the navigate function
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [sendNotification] = useSendNotificationMutation();
  const [cancelAppointment, _] = useCancelAppointmentMutation();
  const [sendEmail] = useSendEmailMutation();

  const navigateToPatientFollowUp = () => {
    navigate("PatientFollowUp", { state: appointment.patient }); // Use the patient to navigate
  };
  const colors = {
    upcoming: "warning",
    cancelled: "danger",
    completed: "success",
    unbooked: "primary",
    rescheduled: "primary",
  };

  const currDate = dayjs();
  const appointmentDate = dayjs(appointment.formattedDate);
  if (appointment.status !== "cancelled" && appointment.status !== "rescheduled") {
    if (appointmentDate.isAfter(currDate)) {
      appointment = { ...appointment, status: "upcoming" };
    } else {
      appointment = { ...appointment, status: "completed" };
    }
  }

  const handleShowModal = () => setShowCancelModal(true);
  const handleCloseModal = () => setShowCancelModal(false);
  const handleCancel = async () => {
    console.log(appointment);

    //add Cancel Appointment logic here
    await cancelAppointment({
      appointmentId: appointment._id,
    });

    sendNotification({
      recipientUsername: appointment.doctor.username,
      recipientType: "doctor",
      content: `Your appointment with ${
        appointment.patient.name
      } on ${appointment.formattedDate.replace(",", " at")} got cancelled`,
    })
      .unwrap()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    // call sendNotification from to save notification in patient db
    sendNotification({
      recipientUsername: appointment.patient.username,
      recipientType: "patient",
      content: `Your appointment with Dr. ${
        appointment.doctor.name
      } on ${appointment.formattedDate.replace(",", " at")} got cancelled`,
    })
      .unwrap()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    //send socket event to backend
    socket.emit("send_notification_cancelled_by_doctor", {
      sender: appointment.doctor.name,
      receiver: appointment.patient._id,
      contentDoctor: `Your appointment with ${
        appointment.patient.name
      } on ${appointment.formattedDate.replace(",", " at")} got cancelled`,
      contentPatient: `Your appointment with Dr. ${
        appointment.doctor.name
      } on ${appointment.formattedDate.replace(",", " at")} got cancelled`,
    });

    sendEmail({
      email: appointment.patient.email,
      subject: "Cancelled appointment",
      text: `Your appointment with Dr. ${
        appointment.doctor.name
      } on ${appointment.formattedDate.replace(",", " at")} got cancelled`,
    });

    sendEmail({
      email: appointment.doctor.email,
      subject: "Cancelled appointment",
      text: `Your appointment with ${
        appointment.patient.name
      } on ${appointment.formattedDate.replace(",", " at")} got cancelled`,
    });

    setShowCancelModal(false);
  };
  const message = "Are you sure you want to cancel your appointment?";

  const handleReschedule = async () => {
    sendNotification({
      recipientUsername: appointment.doctor.username,
      recipientType: "doctor",
      content: `Your appointment with ${
        appointment.patient.name
      } on ${appointment.formattedDate.replace(",", " at")} got rescheduled`,
    })
      .unwrap()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    // call sendNotification from to save notification in patient db
    sendNotification({
      recipientUsername: appointment.patient.username,
      recipientType: "patient",
      content: `Your appointment with Dr. ${
        appointment.doctor.name
      } on ${appointment.formattedDate.replace(",", " at")} got rescheduled`,
    })
      .unwrap()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    //send socket event to backend
    socket.emit("send_notification_rescheduled_by_doctor", {
      sender: appointment.doctor.name,
      receiver: appointment.patient._id,
      contentDoctor: `Your appointment with ${
        appointment.patient.name
      } on ${appointment.formattedDate.replace(",", " at")} got rescheduled`,
      contentPatient: `Your appointment with Dr. ${
        appointment.doctor.name
      } on ${appointment.formattedDate.replace(",", " at")} got rescheduled`,
    });

    sendEmail({
      email: appointment.patient.email,
      subject: "Rescheduled appointment",
      text: `Your appointment with Dr. ${
        appointment.doctor.name
      } on ${appointment.formattedDate.replace(",", " at")} got rescheduled`,
    });

    sendEmail({
      email: appointment.doctor.email,
      subject: "Rescheduled appointment",
      text: `Your appointment with ${
        appointment.patient.name
      } on ${appointment.formattedDate.replace(",", " at")} got rescheduled`,
    });

  };

  return (
    <Box sx={{ width: "100%", marginBottom: "16px" }}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "row", // Align children horizontally
          justifyContent: "space-between", // Distribute space between image and content
          overflow: "hidden",
          boxShadow: "md", // Shadow for the card
          borderRadius: "sm", // Border radius of the card
        }}
        className="hover:shadow-lg" // Tailwind CSS for hover shadow effect
      >
        <AspectRatio ratio="1" maxHeight={150} sx={{ minWidth: 150 }}>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
            srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x"
            loading="lazy"
            alt=""
          />
        </AspectRatio>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column", // Stack children vertically inside card content
            justifyContent: "space-between", // Space between card content children
            flexGrow: 1, // card content will grow to fill container
            minWidth: 0, // Fixes flexbox overflow issues with text
          }}
        >
          <Box className="flex flex-row justify-between mb-2">
            <Typography level="h3" fontWeight="lg">
              {capitalizeFirstLetter(appointment.patient.name)}
            </Typography>
            <Chip color={colors[appointment.status]} variant="soft">
              <Typography level="title-md">{capitalizeFirstLetter(appointment.status)}</Typography>
            </Chip>
          </Box>

          <Divider />

          <Box className="flex flex-col space-y-2 mt-3">
            <Typography
              level="body-md"
              textColor="text.tertiary"
              startDecorator={<AccessTimeIcon fontSize="small" />}
            >
              {appointment.formattedDate}
            </Typography>
            <Typography
              level="body-md"
              textColor="text.tertiary"
              startDecorator={<MarkunreadIcon fontSize="small" />}
            >
              {appointment.patient.email}
            </Typography>
            <div className="flex justify-between">
              <Typography
                level="body-md"
                textColor="text.tertiary"
                startDecorator={<PhoneIcon fontSize="small" />}
              >
                {appointment.patient.mobile}
              </Typography>
              {appointment.status === "completed" && (
                <Button variant="plain" onClick={navigateToPatientFollowUp} size="md">
                  Follow Up
                </Button>
              )}

              {["upcoming", "rescheduled"].includes(appointment.status) && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <RescheduleAppointment appointmentId={appointment._id} handleClickNotif={handleReschedule}/>
                  <Tooltip placement="top" title="Cancel an appointment">
                    <IconButton aria-label="call" size="md" onClick={handleShowModal}>
                      <BiCalendarX fontSize={24} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </div>
          </Box>

          {/* Button positioned at the bottom left */}
        </CardContent>
      </Card>
      <TwoButtonModal
        open={showCancelModal}
        handleClose={handleCloseModal}
        handleClickLogic={handleCancel}
        message={message}
      />
    </Box>
  );
}

function capitalizeFirstLetter(string) {
  // Check if the string is empty or null
  if (!string) {
    return string;
  }
  let name = string.split(" ");
  let result = "";

  for (let i = 0; i < name.length; i++) {
    const string = name[i].charAt(0).toUpperCase() + name[i].slice(1);
    result = result + " " + string;
  }

  // Capitalize the first letter and concatenate it with the rest of the string
  return result;
}

export { capitalizeFirstLetter };
