import React, { useState } from "react";
import * as AppGeneral from "../socialcalc/AppGeneral";
import { File, Local } from "../storage/LocalStorage";
import { isPlatform, IonToast } from "@ionic/react";
import { EmailComposer } from "@ionic-native/email-composer";
import { Printer } from "@ionic-native/printer";
import { IonActionSheet, IonAlert } from "@ionic/react";
import { saveOutline, save, mail, print } from "ionicons/icons";
import MailComposer from 'nodemailer/lib/mail-composer';
import nodeMailer from 'nodemailer';

const Menu: React.FC<{
  showM: boolean;
  setM: Function;
  file: string;
  updateSelectedFile: Function;
  store: Local;
  bT: number;
}> = (props) => {
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [showAlert3, setShowAlert3] = useState(false);
  const [showAlert4, setShowAlert4] = useState(false);
  const [showToast1, setShowToast1] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  /* Utility functions */
  const _validateName = async (filename) => {
    filename = filename.trim();
    if (filename === "default" || filename === "Untitled") {
      setToastMessage("Cannot update default file!");
      return false;
    } else if (filename === "" || !filename) {
      setToastMessage("Filename cannot be empty");
      return false;
    } else if (filename.length > 30) {
      setToastMessage("Filename too long");
      return false;
    } else if (/^[a-zA-Z0-9- ]*$/.test(filename) === false) {
      setToastMessage("Special Characters cannot be used");
      return false;
    } else if (await props.store._checkKey(filename)) {
      setToastMessage("Filename already exists");
      return false;
    }
    return true;
  };

  const getCurrentFileName = () => {
    return props.file;
  };

  const _formatString = (filename) => {
    /* Remove whitespaces */
    while (filename.indexOf(" ") !== -1) {
      filename = filename.replace(" ", "");
    }
    return filename;
  };

  const doPrint = () => {
    if (isPlatform("hybrid")) {
      const printer = Printer;
      printer.print(AppGeneral.getCurrentHTMLContent());
    } else {
      const content = AppGeneral.getCurrentHTMLContent();
      // console.log(content);
      // localStorage.setItem("data", content.toString());
      var printWindow = window.open("", "", "left=100,top=100");
      printWindow.document.write(content);
      printWindow.print();
    }
  };

  const doSave = () => {
    if (props.file === "default") {
      setShowAlert1(true);
      return;
    }
    const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
    const data = props.store._getFile(props.file);
    // console.log(data);
    const file = new File(
      (data as any).created,
      new Date().toString(),
      content,
      props.file,
      props.bT
    );

    props.store._saveFile(file);
    props.updateSelectedFile(props.file);
    setShowAlert2(true);


    const c = AppGeneral.getCurrentHTMLContent();
    let fileName = props.file;
    localStorage.setItem(fileName, c);
  };

  const doSaveAs = async (filename) => {
    // event.preventDefault();
    if (filename) {
      // console.log(filename, _validateName(filename));
      if (await _validateName(filename)) {
        // filename valid . go on save
        const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
        // console.log(content);
        const file = new File(
          new Date().toString(),
          new Date().toString(),
          content,
          filename,
          props.bT
        );
        // const data = { created: file.created, modified: file.modified, content: file.content, password: file.password };
        // console.log(JSON.stringify(data));
        const c = AppGeneral.getCurrentHTMLContent(); //this is the html code
        localStorage.setItem(filename, c); // 
        let prev = localStorage.getItem("noOfFiles") === null ? 1 : (Number)(localStorage.getItem("noOfFiles")) + 1;
        localStorage.setItem("noOfFiles", prev.toString());
        // console.log(localStorage.getItem("noOfFiles"));
        props.store._saveFile(file);
        props.updateSelectedFile(filename);
        setShowAlert4(true);
      } else {
        setShowToast1(true);
      }
    }
  };


  const sendEmail = async (s, r) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Set the content type to plain text
      },
      body: JSON.stringify({
        sender: s,
        receiver: r,
        dataa: AppGeneral.getCurrentHTMLContent()
      }),
    };
    const response = await fetch("http://localhost:4000/sendEmail", requestOptions);
    console.log("RR", response);
    if (response.status === 404) {
      setError(true);
    }
    else
      setEmailAlert(true);
  }


  const [showEmail, setEmail] = useState(false);
  const [emailAlert, setEmailAlert] = useState(false);
  const [error, setError] = useState(false);

  return (
    <React.Fragment>
      <IonActionSheet
        animated
        keyboardClose
        isOpen={props.showM}
        onDidDismiss={() => props.setM()}
        buttons={[
          {
            text: "Save",
            icon: saveOutline,
            handler: () => {
              doSave();
              console.log("Save clicked");
            },
          },
          {
            text: "Save As",
            icon: save,
            handler: () => {
              setShowAlert3(true);
              console.log("Save As clicked");
            },
          },
          {
            text: "Print",
            icon: print,
            handler: () => {
              doPrint();
              console.log("Print clicked");
            },
          },
          {
            text: "Email",
            icon: mail,
            handler: () => {
              setEmail(true);
              console.log("Email clicked");
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header='Alert Message'
        message={
          "Cannot update <strong>" + getCurrentFileName() + "</strong> file!"
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert2}
        onDidDismiss={() => setShowAlert2(false)}
        header='Save'
        message={
          "File <strong>" +
          getCurrentFileName() +
          "</strong> updated successfully"
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert3}
        onDidDismiss={() => setShowAlert3(false)}
        header='Save As'
        inputs={[
          { name: "filename", type: "text", placeholder: "Enter filename" },
        ]}
        buttons={[
          {
            text: "Ok",
            handler: (alertData) => {
              doSaveAs(alertData.filename);
            },
          },
        ]}
      />



      <IonAlert
        animated
        isOpen={showEmail}
        onDidDismiss={() => setEmail(false)}
        header='Email'
        inputs={[
          { name: "sender", type: "email", placeholder: "Enter Your Email" },
          { name: "receiver", type: "email", placeholder: "Enter Receiver's Email" },
        ]}
        buttons={[
          {
            text: "Send",
            handler: (alertData) => {
              sendEmail(alertData.sender, alertData.receiver);
            },
          },
        ]}
      />


      <IonAlert
        animated
        isOpen={emailAlert}
        onDidDismiss={() => setEmailAlert(false)}
        header='Email Sent SuccessFully!'
        // inputs={[
        //   { name: "filename", type: "text", placeholder: "Enter filename" },
        // ]}
        buttons={[
          {
            text: "Ok",
            handler: (alertData) => {
              // doSaveAs(alertData.filename);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={error}
        onDidDismiss={() => setError(false)}
        header='Please Fill the correct Email IDs!'
        // inputs={[
        //   { name: "filename", type: "text", placeholder: "Enter filename" },
        // ]}
        buttons={[
          {
            text: "Ok",
            handler: (alertData) => {
              // doSaveAs(alertData.filename);
            },
          },
        ]}
      />








      <IonAlert
        animated
        isOpen={showAlert4}
        onDidDismiss={() => setShowAlert4(false)}
        header='Save As'
        message={
          "File <strong>" +
          getCurrentFileName() +
          "</strong> saved successfully"
        }
        buttons={["Ok"]}
      />
      <IonToast
        animated
        isOpen={showToast1}
        onDidDismiss={() => {
          setShowToast1(false);
          setShowAlert3(true);
        }}
        position='bottom'
        message={toastMessage}
        duration={500}
      />
    </React.Fragment>
  );
};

export default Menu;
