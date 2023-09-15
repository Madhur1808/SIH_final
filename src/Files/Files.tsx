import React, { useState, useEffect } from "react";
import "./Files.css";
import * as AppGeneral from "../socialcalc/AppGeneral";
import { DATA } from "../app-data.js";
import { Local } from "../storage/LocalStorage";
import {
  IonIcon,
  IonModal,
  IonItem,
  IonButton,
  IonList,
  IonLabel,
  IonAlert,
  IonItemGroup
} from "@ionic/react";
import { fileTrayFull, list, trash, create } from "ionicons/icons";


const Files: React.FC<{
  store: Local;
  file: string;
  updateSelectedFile: Function;
  updateBillType: Function;
}> = (props) => {
  const [modal, setModal] = useState(null);
  const [listFiles, setListFiles] = useState(false);
  const [showAlert1, setShowAlert1] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);

  const editFile = (key) => {
    props.store._getFile(key).then((data) => {
      AppGeneral.viewFile(key, decodeURIComponent((data as any).content));
      props.updateSelectedFile(key);
      props.updateBillType((data as any).billType);
    });
    // console.log(JSON.stringify(data));
  };

  const deleteFile = (key) => {
    // event.preventDefault();
    setShowAlert1(true);
    setCurrentKey(key);
  };

  const loadDefault = () => {
    const msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
  };

  const _formatDate = (date) => {
    return new Date(date).toLocaleString();
  };


  let arr = new Array(Number(localStorage.getItem("noOfFiles"))).fill(false);
  const [selected, setSelected] = useState(arr);


  const temp = async () => {
    const data = await props.store._getAllFiles();

    let Id = 0;


    const fileList = Object.keys(data).map((key, Id) => {
      return (
        <IonItemGroup key={key}>
          <IonItem>
            {/* added checkbox */}
            <input type="checkbox" name={key} id={Id.toString()} onChange={(e) => {
              let state = e.target.checked;
              let i = e.target.id;
              selected[i] = state;
              setSelected(selected);
            }} />

            <IonLabel>{key}</IonLabel>
            {_formatDate(data[key])}
            <IonIcon
              icon={create}
              color='warning'
              slot='end'
              size='large'
              onClick={() => {
                setListFiles(false);
                editFile(key);
              }}
            />
            <IonIcon
              icon={trash}
              color='danger'
              slot='end'
              size='large'
              onClick={() => {
                setListFiles(false);
                deleteFile(key);
              }}
            />
          </IonItem>
        </IonItemGroup>
      );
    });

    const uploadHandler = async () => {
      const data = await props.store._getAllFiles();
      let iter = 0;
      for (const key in data) {
        if (selected[iter] === true) {
          let data = localStorage.getItem(key);

          const url = "http://localhost:4000/api/dropbox/redirect";

          const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain', // Set the content type to plain text
            },
            body: JSON.stringify({
              data: data,
              fileName: key
            }), // Set the string as the request body
          };

          const res1 = await fetch("http://localhost:4000/save", requestOptions);

          const authorizationUrl = "https://www.dropbox.com/oauth2/authorize?client_id=m4of4ek7lvyylpo&redirect_uri=http://localhost:4000/api/verify/redirect&response_type=code";

          window.location.href = authorizationUrl;

        }
        iter++;
      }
    }

    const ourModal = (
      <IonModal isOpen={listFiles} onDidDismiss={() => setListFiles(false)}>
        <IonList>{fileList}</IonList>
        {/* added upload to Dropobox button */}
        <IonButton
          expand='block'
          color='secondary'
          onClick={() => {
            uploadHandler();
          }}
        >
          Upload Selected Files to Dropobox
        </IonButton>



        <IonButton
          expand='block'
          color='secondary'
          onClick={() => {
            setListFiles(false);
          }}
        >
          Back
        </IonButton>
      </IonModal>
    );
    setModal(ourModal);
  };

  useEffect(() => {
    temp();
  }, [listFiles]);

  return (
    <React.Fragment>
      <IonIcon
        icon={fileTrayFull}
        className='ion-padding-end'
        slot='end'
        size='large'
        onClick={() => {
          setListFiles(true);
        }}
      />
      {modal}
      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header='Delete file'
        message={"Do you want to delete the " + currentKey + " file?"}
        buttons={[
          { text: "No", role: "cancel" },
          {
            text: "Yes",
            handler: () => {
              props.store._deleteFile(currentKey);
              loadDefault();
              setCurrentKey(null);
            },
          },
        ]}
      />
    </React.Fragment>
  );
};

export default Files;
