import { useState } from "react";

import { Button, Card, Grid } from "@material-ui/core";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import "./App.css";
import CustomBeatLoader from "./components/CustomBeatLoader";
import EmailField from "./components/EmailField";
import Snack from "./components/Snack";
import Title from "./components/Title";
import UploadTextField from "./components/UploadTextField";
import VideoInfo from "./components/VideoInfo";
import VideoUploader from "./components/VideoUploader";

function App() {
  const { handleSubmit } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState("");
  const [error, setError] = useState("");
  const [voice, setVoice] = useState("Joanna");
  const [uploadText, setUploadText] = useState("");
  const [summarisedText, setSummarisedText] = useState(uploadText);
  const [uploadEmail, setUploadEmail] = useState("");
  const [translate, setTranslate] = useState(false);
  const successMessage =
    "Submitted! You will receive the result video in your email when it is ready. This should take about 5 minutes for a ~20s video. Please contact us at mediate.official@gmail.com if you face any difficulties! :)";
  const errorMessage =
    "Sorry, our services are currently not running. Please contact at mediate.official@gmail.com  for assistance!";

  const submit = (data) => {
    setSubmitting(true);

    // * Endpoint to lambda that will run our notebook
    const url =
      "https://8c3vifq9mj.execute-api.ap-southeast-1.amazonaws.com/default/test-socket";
    fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        // No need to overwrite Access-Control-Allow-Origin	here!
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: uploadEmail,
        uploadText: summarisedText || uploadText,
        lessonVid: false,
        translate: translate,
        mediaType: "media/mp4",
        voice: voice,
      }), // Make sure JSON data
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        return typeof res === "string"
          ? setComplete(successMessage) // AWS Lambda returns string if successful
          : setError(errorMessage); // If AWS services are not running
      })
      .then(() => setSubmitting(false)) // Should be inside the fetch scope to avoid jumping ahead
      .catch((error) => {
        console.log(error);
        setError(error);
        setSubmitting(false); // Still set to false when fetch fails
      });
  };

  return (
    <AppStyled>
      <div className="App">
        <Helmet>
          <meta charSet="utf-8" />
          <title>MediaTE</title>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Helmet>

        <Card elevation="5" className="card-container">
          <Title />
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <EmailField setUploadEmail={setUploadEmail} />
            </Grid>
            <Grid item xs={12}>
              <UploadTextField
                uploadText={uploadText}
                setUploadText={setUploadText}
                summarisedText={summarisedText}
                setSummarisedText={setSummarisedText}
                voice={voice}
                setVoice={setVoice}
                translate={translate}
                setTranslate={setTranslate}
              />
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <VideoUploader />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VideoInfo />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <div className="upload-btn">
                {submitting ? (
                  <CustomBeatLoader submitting={submitting} />
                ) : (
                  <form onSubmit={handleSubmit(submit)} className="uploads">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                    >
                      Send my video
                    </Button>
                  </form>
                )}
              </div>
            </Grid>
          </Grid>
        </Card>

        <Snack severity="success" message={complete} setMessage={setComplete} />
        <Snack
          severity="error"
          message={error} // If error is not empty string, show Snack
          setMessage={setError}
        />
      </div>
    </AppStyled>
  );
}

const AppStyled = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 1s ease;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(rgba(22, 35, 122, 0.9), rgba(69, 22, 122, 0.9));
  background-color: black;

  .upload-btn {
    margin-top: 1rem;
  }

  .text-field {
    width: 100%;
  }

  // Following is for text fields
  .MuiOutlinedInput-root {
    fieldset,
    .Mui-focused fieldset {
      border-color: var(--font-light-color);
    }

    &:hover fieldset {
      border-color: var(--success-color);
    }
  }

  // When text field is focused, keep green color
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: var(--success-color);
  }

  // For translate toggle
  .MuiFormGroup-row {
    flex-direction: row;
    justify-content: center;
    margin-top: 1rem;
  }
`;

export default App;
