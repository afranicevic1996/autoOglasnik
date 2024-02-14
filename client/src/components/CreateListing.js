import CustomModal from "./CustomModal";
import StatusBox from "./StatusBox";
import ImagePreviewer from "./ImagePreviewer";

import { StatusContext } from "./contexts/StatusContext";
import {Formik, Form, Field, ErrorMessage} from "formik";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import * as Yup from "yup";

const apiAddress = process.env.REACT_APP_API_ADDRESS;

const CreateListing = () => {

  const [carBrands, setCarBrands] = useState();
  const [carModels, setCarModels] = useState();
  const [carModelsByBrandID, setcarModelsByBrandID] = useState();
  const [previewData, setPreviewData] = useState();
  const [imageFiles, setImageFiles] = useState();

  const { statusMessageContext } = useContext(StatusContext);
  const [statusMessage, setStatusMessage] = statusMessageContext;

  //modal context
  const [modal, setModal] = useState({show: false});

  const initialValues = {
    listingType: "",
    listingName: "",
    price: "",
    desc: "",
    vin: "",
    transmissionType: "",
    gearCount: "",
    brandID: "",
    modelID: "",
    productionYear: "",
    mileage: "",
    engineName: "",
    engineType: "",
    engineKW: "",
    registrationUntilMonth: "",
    registrationUntilYear: "",
    files: ""
  };

  const getModelsByBrandID = (brandID) => {
    if(brandID < 1)
      return null;

    var modelsByID = [];
    brandID = parseInt(brandID);

    carModels.map((model) => {
      if(model.carBrandID === brandID)
        modelsByID.push(model);
      
    })

    setcarModelsByBrandID(modelsByID);
  }

  const getCarBrands = async () => {
    try{
      const response = await axios({
        method: "GET",
        data: {},
        withCredentials: true,
        url: apiAddress + "/getCarBrands"
      });

      setCarBrands(response.data.data);
    }
    catch (error){
      console.log(error);
    }
  }

  const getCarModels = async () => {
    try{
      const response = await axios({
        method: "GET",
        data: {},
        withCredentials: true,
        url: apiAddress + "/getCarModels"
      });

      setCarModels(response.data.data);
    }
    catch (error){
      console.log(error);
    }
  }

  const createFilePreview = (files) => {
    if(!files || files.length === 0){
      setImageFiles(undefined);
      return;
    }

    setImageFiles(files);
  }

  useEffect(() => {
    getCarBrands();
    getCarModels();
  }, []);

  useEffect(() => {
    if(!imageFiles){
      setPreviewData(undefined);
      return;
    }

    var objectUrls = [];
    for(var i = 0; i < imageFiles.length; i++)
      objectUrls.push( { id: i, current: i === 0 ? true : false, src: URL.createObjectURL(imageFiles[i]) } );

    setPreviewData(objectUrls);

    //unmounted
    return () => {
      objectUrls.map((obj) => {
        URL.revokeObjectURL(obj);
      });
    }
  }, [imageFiles]);

  const handleSubmit = async (data) => {
    handleModalClose();

    console.log(data);
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data"},
        url: apiAddress + "/createListing"
      });

      setStatusMessage({show: true, error: response.data.error, message: response.data.message});
    }
    catch (error){
      console.log(error);
    }
  }

  const validationSchema = Yup.object().shape({
    listingType: Yup.number().min(1, "min 1").required("min 1 required"),
    listingName: Yup.string().trim().min(6, "Listing name must contain at least 6 characters")
      .max(100, "Listing name must contain at most 100 characters").required("Listing name is required"),
    price: Yup.number().required().typeError("Only numbers allowed"),
    desc: Yup.string().trim().required().max(200, "Description can be at most 200 characters long"),
    brandID: Yup.number().min(1).required(),
    modelID: Yup.number().min(1).required(),
    transmissionType: Yup.number().min(1).required(),
    productionYear: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").min(4, 'Must be exactly 4 digits').max(4, 'Must be exactly 4 digits')
    .test("pyear", "Must start with 1 or 2", (pyear) => {
      return pyear[0] > 0 && pyear[0] < 3
    }),
    mileage: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").max(7, 'Must be 7 digits long')
    .test("mileage", "Can't start with 0", (num) => {
      return num[0] > 0
    }),
    gearCount: Yup.number().min(3, "Numbers from 3-10 allowed").max(10, "Numbers from 3-10 allowed").required().typeError("Only numbers allowed"),
    engineName: Yup.string().trim().required("Required field").matches(/^\d{1,1}.\d{1,1}$/, "Must be in format [0-9].[0-9]"),
    engineType: Yup.number().min(1).required(),
    engineKW: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").min(1, 'Must be at least 1 digit long').max(4, 'Must be at most 4 digits long')
    .test("ekw", "Can't start with 0", (pyear) => {
      return pyear[0] != 0
    }),
    registrationUntilMonth: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").min(1, 'Must be at least 1 digit long').max(2, 'Must be at most 2 digits long')
    .test("rum", "Must start with 0 or 1", (pyear) => {
      return pyear[0] == 0 || pyear[0] == 1
    }),
    registrationUntilYear: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").min(4, 'Must be exactly 4 digits').max(4, 'Must be exactly 4 digits')
    .test("ruy", "Must start with 1 or 2", (pyear) => {
      return pyear[0] > 0 && pyear[0] < 3
    }),
  });

  const handleModalOpen = (event, text, isForm, func) => {
    if(isForm)
      setModal({show: true, text: text, isForm: isForm, target: event.target});
    else
      setModal({show: true, text: text, isForm: isForm, target: event.target, onConfirm: func});
  }

  const handleModalClose = () => {
    setModal({show: false});
  }

  return(
    <>
      <CustomModal modalData={modal} onModalClose={handleModalClose} />
      <StatusBox />
      {(carBrands && carModels) &&
        <>
        <div className="login-box">

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, touched, errors, dirty, isSubmitting, handleChange, handleBlur, handleSubmit, handleReset, setFieldValue }) => (
              <Form id="createListing">
                <div className="login-container-grid">

                  <div className="login-header">
                    <div>Create Listing</div>
                  </div>

                  <div className="login-body">

                    <div className="login-input">
                      <label>Type: </label><br />
                      <Field as="select" name="listingType">
                        <option value="0">Choose listing type</option>
                        <option value="1">Novo</option>
                        <option value="2">Rabljeno</option>
                        <option value="3">Dijelovi/Karambol</option>
                      </Field>
                      <ErrorMessage name="listingType" className="error" component="div" />
                    </div>
                    
                    <div className="login-input">
                      <label>Name: </label><br />
                      <Field placeholder="Name" type="text" name="listingName" />
                      <ErrorMessage name="listingName" className="error" component="div" />
                    </div>
                    
                    <div className="login-input">
                      <label>Price: </label><br />
                      <Field placeholder="Price" type="text" name="price" />
                      <ErrorMessage name="price" className="error" component="div" />
                    </div>

                    <div className="login-input">
                      <label>Description: </label><br />
                      <Field placeholder="Description" name="desc" as="textarea" />
                      <ErrorMessage name="desc" className="error" component="div" />
                    </div>


                    <div className="login-input">
                      <label>VIN: (optional)</label><br />
                      <Field placeholder="VIN" type="text" name="vin" />
                      <ErrorMessage name="vin" className="error" component="div" />
                    </div>


                    <div className="login-input">
                      <label>Car brand name: </label><br />
                      <Field as="select" name="brandID" onChange={(event) => {
                        setFieldValue("brandID", event.target.value);
                        setFieldValue("modelID", 0);
                        setcarModelsByBrandID(undefined);
                        getModelsByBrandID(event.target.value);
                      }}>
                        <option value="0">Choose car brand</option>
                        {carBrands.map((model, key) =>
                          <option key={key+model.id} value={model.id}>{model.name}</option>
                        )}
                      </Field>
                      <ErrorMessage name="brandID" className="error" component="div" />
                    </div>

                    <div className="login-input">
                    <label>Car model name: </label><br />
                      <Field as="select" name="modelID">
                        <option value="0">Choose car model</option>
                        {carModelsByBrandID &&
                          carModelsByBrandID.map((element, key) => 
                            <option key={key+element.id} value={element.id}>{element.name}</option>
                          )
                        }
                      </Field>
                      <ErrorMessage name="modelID" className="error" component="div" />
                    </div> 

                    <div className="login-input">
                      <label>Production year: </label><br />
                      <Field placeholder="Production year" type="text" name="productionYear" />
                      <ErrorMessage name="productionYear" className="error" component="div" />
                    </div>

                    <div className="login-input">
                      <label>Mileage (km): </label><br />
                      <Field placeholder="Mileage" type="text" name="mileage" />
                      <ErrorMessage name="mileage" className="error" component="div" />
                    </div>

                    <div className="login-input">
                    <label>Transmission type: </label><br />
                      <Field as="select" name="transmissionType">
                        <option value="0">Choose transmission type</option>
                        <option value="1">Manual</option>
                        <option value="2">Automatic</option>
                        <option value="3">Automatic - sequential</option>
                      </Field>
                      <ErrorMessage name="transmissionType" className="error" component="div" />
                    </div> 

                    <div className="login-input">
                      <label># of gears: </label><br />
                      <Field placeholder="# of gears" type="text" name="gearCount" />
                      <ErrorMessage name="gearCount" className="error" component="div" />
                    </div>

                    <div className="login-input">
                      <label>Engine displacement: </label><br />
                      <Field placeholder="Engine name" type="text" name="engineName" />
                      <ErrorMessage name="engineName" className="error" component="div" />
                    </div>

                    <div className="login-input">
                      <label>Engine type: </label><br />
                      <Field as="select" name="engineType">
                        <option value="0">Choose engine type</option>
                        <option value="1">Diesel</option>
                        <option value="2">Gasoline</option>
                        <option value="3">EV</option>
                        <option value="4">Hybrid</option>
                      </Field>
                      <ErrorMessage name="engineType" className="error" component="div" />
                    </div>

                    <div className="login-input">
                      <label>Engine power (kW): </label><br />
                      <Field placeholder="Engine power" type="text" name="engineKW" />
                      <ErrorMessage name="engineKW" className="error" component="div" />
                    </div>

                    <div className="login-input">
                      <label>Registration valid until: </label><br />
                      <Field placeholder="Month" type="text" name="registrationUntilMonth" />
                      <ErrorMessage name="registrationUntilMonth" className="error" component="div" />
                      <Field placeholder="Year" type="text" name="registrationUntilYear" />
                      <ErrorMessage name="registrationUntilYear" className="error" component="div" />
                    </div>

                    <label>Add Pictures: </label><br />
                    <ErrorMessage name="carFiles" className="error" component="div" />
                    <input name="carFiles" type="file" accept="image/*" multiple onChange={(event) => {
                      setFieldValue("carFiles", event.target.files);
                      createFilePreview(event.target.files);
                    }} />
                    

                  </div>

                  <div className="login-footer">
                    <button type="button" id="createListing" onClick={(e) => {handleModalOpen(e, "Do you want to create listing ?", true)}}>Create</button>
                  </div>

                </div>
              </Form>
            )}
          </Formik>
        </div>

        {(imageFiles && previewData) &&
            <ImagePreviewer data={previewData} setImages={setPreviewData} />
        }
        
        </>
      } 
    </>
  )
}

export default CreateListing