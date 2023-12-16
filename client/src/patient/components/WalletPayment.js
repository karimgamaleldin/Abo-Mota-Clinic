import { useFetchPatientQuery, usePayByWalletMutation } from "../../store";
import { Button, Typography } from "@mui/joy";
import { useState } from "react";
import { useSendNotificationMutation, useSendEmailMutation } from "../../store";
import LoadingIndicator from "../../shared/Components/LoadingIndicator";

function WalletPayment({
  deductible,
  onSuccess,
  onFailure,
  selectedUser,
}) {
  const {
    data: patient,
    isFetching: isFetchingPatient,
    error: isFetchingPatientError,
  } = useFetchPatientQuery();
  const [payByWallet, walletResults] = usePayByWalletMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendNotification] = useSendNotificationMutation();
  const [sendEmail] = useSendEmailMutation();

  const handlePayByWallet = (e) => {
    e.preventDefault();

    setIsProcessing(true);

    payByWallet({
      deductible,
    })
      .unwrap()
      .then((res) => {
        console.log(res);
        onSuccess();
        setIsProcessing(false);

        //send notification to doctor and myself
        // call sendNotification from commonApi.js to save notification in doctor db
        // sendNotification({
        //   recipientUsername: doctor.username,
        //   recipientType: "doctor",
        //   content: `You have a new appointment with ${patient.name} on ${details.date} at ${details.currentTime}`,
        // })
        //   .unwrap()
        //   .then((res) => console.log(res))
        //   .catch((err) => console.log(err));

        // call sendNotification to save notification in patient db
        // sendNotification({
        //   recipientUsername: patient.username,
        //   recipientType: "patient",
        //   content: `Your appointment is booked successfully with Dr. ${doctor.name} on ${details.date} at ${details.currentTime}`,
        // })
        //   .unwrap()
        //   .then((res) => console.log(res))
        //   .catch((err) => console.log(err));

        //send socket event to backend
        // socket.emit("send_notification_booked", {
        //   sender: patient._id,
        //   receiver: doctor._id,
        //   contentDoctor: `You have a new appointment with ${patient.name} on ${details.date} at ${details.currentTime}`,
        //   contentPatient: `Your appointment is booked successfully with Dr. ${doctor.name} on ${details.date} at ${details.currentTime}`,
        // });
      })
      .catch((err) => {
        onFailure();
        setIsProcessing(false);
      });

    // sendEmail({
    //   email: patient.email,
    //   subject: 'New appointment',
    //   text: `Your appointment with Dr. ${doctor.name} on ${details.date} at ${details.currentTime} got rescheduled`
    // });

    // sendEmail({
    //   email: doctor.email,
    //   subject: 'New appointment',
    //   text: `Your appointment with ${patient.name} on ${details.date} at ${details.currentTime} got rescheduled`
    // });

  };

  if (isFetchingPatient) {
    return <LoadingIndicator />;
  } else if (isFetchingPatientError) {
    return <div> Error ... </div>;
  }

  return (
    <form onSubmit={handlePayByWallet}>
      <Typography level="h3" fontWeight={500}>
        Available Balance - ${parseFloat(patient.wallet.toFixed(2))}
      </Typography>
      <Button
        type="submit"
        variant="solid"
        disabled={isProcessing || selectedUser === -1 || patient.wallet < deductible}
        id="submit"
        sx={{ width: "100%", my: 3, borderRadius: 1 }}
      // onClick={handlePayByWallet}
      >
        <span id="Button-text">{isProcessing ? "Processing ... " : "Pay"}</span>
      </Button>

      <Typography level="body-sm">By clicking Pay you agree to the Terms & Conditions.</Typography>
    </form>
  );
}

export default WalletPayment;
