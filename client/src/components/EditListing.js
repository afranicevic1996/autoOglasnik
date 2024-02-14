import CustomModal from "./CustomModal";
import StatusBox from "./StatusBox";
import ImagePreviewer from "./ImagePreviewer";
import { StatusContext } from "./contexts/StatusContext";

import {Formik, Form, Field, ErrorMessage} from "formik";
import { useContext, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import * as Yup from "yup";

import "../css/EditListing.css";

const apiAddress = process.env.REACT_APP_API_ADDRESS;

const EditListing = () => {
  const [carBrands, setCarBrands] = useState();
  const [carModels, setCarModels] = useState();
  const [carModelsByBrandID, setcarModelsByBrandID] = useState();
  const [initialValues, setInitialValues] = useState();
  const [filesToDelete, setFilesToDelete] = useState();

  const { statusMessageContext } = useContext(StatusContext);
  const [statusMessage, setStatusMessage] = statusMessageContext;

  //image add/preview
  const [filesToAdd, setFilesToAdd] = useState();
  const [previewData, setPreviewData] = useState();
  const [imageFiles, setImageFiles] = useState();

  //modal context
  const [modal, setModal] = useState({show: false});

  var { id } = useParams();

  const createFilePreview = (files) => {
    if(!files || files.length === 0){
      setImageFiles(undefined);
      return;
    }

    console.log("kreacija imageFiles");
    setImageFiles(files);
  }

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

  const createInitialValues = async (listing) => {
    var initialValues = {};
    for(const property in listing){
      if(property !== "userID" && property !== "createdAt")
        initialValues[property] = listing[property];
    }

    setInitialValues(initialValues);
  }

  const getListing = async () => {
    try{
      const response = await axios({
        method: "GET",
        withCredentials: true,
        url: apiAddress + "/getListing/" + id
      });

      var listing = response.data.data;
      var images = listing.files.length < 1 ? [] : listing.files.split(",");

      images.forEach((image, index) => {
        images[index] = "/images/" + image;
      });

      listing.files = images;
      var imagesToDelete = [];
      images.forEach((image, i) => {
        imagesToDelete.push({id: i, delete: false, current: i === 0 ? true : false, src: image});
      });

      setFilesToDelete(imagesToDelete);
      createInitialValues(listing);
    }
    catch (error){
      console.log(error);
    }
  }

  const validationSchema = Yup.object().shape({
    listingType: Yup.number().min(1, "min 1").required("min 1 required"),
    name: Yup.string().trim().min(6, "Listing name must contain at least 6 characters")
      .max(100, "Listing name must contain at most 100 characters").required("Listing name is required"),
    price: Yup.number().required().typeError("Only numbers allowed"),
    description: Yup.string().trim().required().max(200, "Description can be at most 200 characters long"),
    carBrandID: Yup.number().min(1).required(),
    carModelID: Yup.number().min(1).required(),
    transmissionType: Yup.number().min(1).required(),
    productionYear: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").min(4, 'Must be exactly 4 digits').max(4, 'Must be exactly 4 digits')
    .test("pyear", "Must start with 1 or 2", (pyear) => {
      return pyear[0] > 0 && pyear[0] < 3
    }),
    mileage: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").max(7, 'Must be 7 digits long')
    .test("mileage", "Can't start with 0", (num) => {
      return num[0] > 0
    }),
    gearcount: Yup.number().min(3, "Numbers from 3-10 allowed").max(10, "Numbers from 3-10 allowed").required().typeError("Only numbers allowed"),
    engineName: Yup.string().trim().required("Required field").matches(/^\d{1,1}.\d{1,1}$/, "Must be in format [0-9].[0-9]"),
    engineType: Yup.number().min(1).required(),
    engineKW: Yup.string().trim().required().matches(/^[0-9]+$/, "Only numbers allowed").min(1, 'Must be at least 1 digit long').max(4, 'Must be at most 4 digits long')
    .test("ekw", "Can't start with 0", (pyear) => {
      return pyear[0] !== 0
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

  const handleTextSubmit = async (data) => {
    handleModalClose();
    var submitData = {id: id};
    submitData = {...submitData, ...data};

    try{
      const response = await axios({
        method: "POST",
        data: submitData,
        withCredentials: true,
        headers: {"content-type": "application/json"},
        url: apiAddress + "/editListing"
      });

      setStatusMessage({show: true, error: response.data.error, message: response.data.message});
    }
    catch (error){
      console.log(error);
    }
  }

  const handleChange = (e) => {
    console.log("handle change ran")
    var checkboxName = e.target.name;
    var filesToDeleteCopy = filesToDelete;
    filesToDeleteCopy.forEach((image, index) => {
      if(image.src === checkboxName)
        filesToDeleteCopy[index].delete = !filesToDeleteCopy[index].delete;
    });

    console.log(filesToDeleteCopy);
    setFilesToDelete(filesToDeleteCopy);
  }

  const handleDelete = async (deleteOption, imagesList) => {
    handleModalClose();
    console.log("u delete smo")
    console.log(deleteOption);
    console.log(imagesList);

    if(deleteOption === "selected"){
      var selectedList = [];
      imagesList.forEach((image) => {
        if(image.delete){
          selectedList.push(image);
        }
      });

      imagesList = selectedList;
    }

    if(deleteOption === "all"){
      imagesList.forEach((image, index) => {
        imagesList[index].delete = true;
      });
    }

    var data = {id: id, filesToDelete: imagesList};
    console.log(data);
    //send data to server
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        headers: {"content-type": "application/json"},
        url: apiAddress + "/editListing"
      });

      if(response.data.error){
        setStatusMessage({show: true, error: response.data.error, message: response.data.message});
        return;
      }

      var newImageString = response.data.data;
      var images = [];
      newImageString = newImageString.length < 1 ? [] : newImageString.split(",");

      newImageString.forEach((image, index) => {
        images.push({id: index, delete: false, current: index === 0 ? true : false, src: "/images/" + image});
      });

      setFilesToDelete(images);
      setStatusMessage({show: true, error: response.data.error, message: response.data.message});
    }
    catch (error){
      console.log(error);
    }
    
  }

  const handleAdd = async (e) => {
    handleModalClose();
    //e.preventDefault();
    if(!filesToAdd || filesToAdd.length === 0){
      console.log("empty");
      return;
    }

    var data = {id: id, carFiles: filesToAdd};
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        headers: {"Content-Type": "multipart/form-data"},
        url: apiAddress + "/editListing"
      });

      var newImageString = response.data.data;
      newImageString = newImageString.split(",");
      var imagesToDelete = [];

      newImageString.forEach((image) => {
        imagesToDelete.push({delete: false, name: "/images/" + image});
      });

      setFilesToDelete(imagesToDelete);
      setPreviewData(undefined);
      setStatusMessage({show: true, error: response.data.error, message: response.data.message});
    }
    catch (error){
      console.log(error);
    }
  }

  useEffect(() => {
    getListing();
    getCarBrands();
    getCarModels();
  }, []);

  useEffect(() => {
    if(initialValues && carBrands && carModels)
      getModelsByBrandID(initialValues.carBrandID);

  }, [initialValues, carBrands, carModels]);

  useEffect(() => {
    if(!imageFiles){
      setPreviewData(undefined);
      return;
    }

    var objectUrls = [];
    for(var i = 0; i < imageFiles.length; i++)
      objectUrls.push(URL.createObjectURL(imageFiles[i]));

    setPreviewData(objectUrls);

    //unmounted
    return () => {
      console.log("unmounts");
      objectUrls.map((obj) => {
        URL.revokeObjectURL(obj);
      });
    }
  }, [imageFiles]);

  const handleModalOpen = (event, text, isForm, func, functionData) => {
    if(isForm)
      setModal({show: true, text: text, isForm: isForm, target: event.target});
    else
      setModal({show: true, text: text, isForm: isForm, target: event.target, onConfirm: func, functionData: functionData});
  }

  const handleModalClose = () => {
    setModal({show: false});
  }

  return (
    <>
      <CustomModal modalData={modal} onModalClose={handleModalClose} />
      <StatusBox />
      {carBrands && carModels && initialValues &&

      <div className="edit-container">

        <div className="login-box resize" >
          <div className="login-header">
            <div>Edit listing</div>
          </div>

          <div className="login-body">
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleTextSubmit}>
            {({ values, touched, errors, dirty, isSubmitting, handleChange, handleBlur, handleSubmit, handleReset, setFieldValue }) => (
              <Form id="editListing">
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
                  <Field placeholder="Name" type="text" name="name" />
                  <ErrorMessage name="name" className="error" component="div" />
                </div>
                
                <div className="login-input">
                  <label>Price: </label><br />
                  <Field placeholder="Price" type="text" name="price" />
                  <ErrorMessage name="price" className="error" component="div" />
                </div>

                <div className="login-input">
                  <label>Description: </label><br />
                  <Field placeholder="Description" name="description" as="textarea" />
                  <ErrorMessage name="description" className="error" component="div" />
                </div>

                <div className="login-input">
                  <label>VIN: (optional)</label><br />
                  <Field placeholder="VIN" type="text" name="vin" />
                  <ErrorMessage name="vin" className="error" component="div" />
                </div>

                <div className="login-input">
                  <label>Car brand name: </label><br />
                  <Field as="select" name="carBrandID" onChange={(event) => {
                    setFieldValue("carBrandID", event.target.value);
                    setFieldValue("carModelID", 0);
                    setcarModelsByBrandID(undefined);
                    getModelsByBrandID(event.target.value);
                  }}>
                    <option value="0">Choose car brand</option>
                    {carBrands.map((model, i) =>
                      <option key={i+model.id} value={model.id}>{model.name}</option>
                    )}
                  </Field>
                  <ErrorMessage name="carBrandID" className="error" component="div" />
                </div>

                <div className="login-input">
                  <label>Car model name: </label><br />
                  <Field as="select" name="carModelID">
                    <option value="0">Choose car model</option>
                    {carModelsByBrandID &&
                      carModelsByBrandID.map((element, i) => 
                        <option key={i+element.id} value={element.id}>{element.name}</option>
                      )
                    }
                  </Field>
                  <ErrorMessage name="carModelID" className="error" component="div" />
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
                  <Field placeholder="# of gears" type="text" name="gearcount" />
                  <ErrorMessage name="gearcount" className="error" component="div" />
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

              </Form>
            )}
            </Formik>
          </div>

          <div className="login-footer">
            <button type="button" id="editListing" onClick={(e) => handleModalOpen(e, "Wanna edit listing ?", true)}>Edit</button>
          </div>

        </div>

        <div className="image-box">
          <ImagePreviewer data={filesToDelete} width={{width: "98%"}} withDelete={{status: true, onDelete: handleDelete}} onDelete={handleDelete} handleModalOpen={handleModalOpen} />              
        </div>

      </div>

      }

      <label>Add Pictures: </label>
      <input name="carFiles" type="file" accept="image/*" multiple onChange={(event) => {
                createFilePreview(event.target.files);
                setFilesToAdd(event.target.files);
              }}/>
      <br />
      <button type="button" onClick={(e) => handleModalOpen(e, "Wanna add images ?", false, handleAdd)}>Add</button>

      {imageFiles &&
          <>
            <span>file preview</span>
            <div>
              {previewData &&
                previewData.map((image, key) => 
                  <img key={key} width={90} heigth={90} src={image} />
                )
              }
            </div>
          </>
        }

    </>

  )
}

export default EditListing