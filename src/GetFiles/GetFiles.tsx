import React, { useState } from "react";
import { IonIcon, IonModal, IonList, IonLabel, IonItem } from "@ionic/react";
import { logoIonic } from "ionicons/icons";

const GetFiles: React.FC = () => {
  const [listFiles, setListFiles] = useState(false);
  const [responseData, setResponseData] = useState([]);

  const getFileHandler = async () => {
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
      };
      const response = await fetch(
        "http://localhost:4000/listfile",
        requestOptions
      );

      if (response.status === 201) {
        const responseData = await response.json();
        console.log("Response Data entries:", responseData.entries);
        setResponseData(responseData.entries);
        setListFiles(true);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data from server:", error);
    }
  };

  const fileList = responseData.map((entry, index) => (
    <IonItem key={index}>
      <IonLabel>{entry.name}</IonLabel>
    </IonItem>
  ));

  return (
    <React.Fragment>
      <IonIcon
        icon={logoIonic}
        className="ion-padding-end"
        slot="end"
        size="large"
        onClick={() => {
          getFileHandler();
        }}
      />
      <IonModal isOpen={listFiles} onDidDismiss={() => setListFiles(false)}>
        <IonList>{fileList}</IonList>
      </IonModal>
    </React.Fragment>
  );
};

export default GetFiles;
