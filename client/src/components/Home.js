import ChooseDialog from "./ChooseDialog";
import Listing from "./Listing";
import Pagination from "./Pagination";
import ListingContainer from "./ListingsContainer";

import { useNavigate, useSearchParams, createSearchParams } from "react-router-dom";
import { useState, useContext, useEffect, Fragment } from "react";
import { ChooseContext } from "./contexts/ChooseContext";

import "../css/Home.css";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [advancedForm, setAdvancedForm] = useState({
    priceFrom: "",
    priceTo: "",
    kwFrom: "",
    kwTo: "",
    pYearFrom: "",
    pYearTo: "",
    engineType: "",
    mileageFrom: "",
    mileageTo: ""
  });

  const [carBrands, setCarBrands] = useState();
  const [carModels, setCarModels] = useState();
  const [carModelsByCheckedBrands, setCarModelsByCheckedBrands] = useState([]);
  const [counties, setCounties] = useState();

  const [listingTypes, setListingTypes] = useState([{id: 1, name: "Novo", checked: false}, {id: 2, name: "Rabljeno", checked: false}, {id: 3, name: "Dijelovi/karambol", checked: false}]);
  const [searchedListings, setSearchedListings] = useState({text: "Search to show data!", data: []});

  const [pagination, setPagination] = useState({page: 1, sortBy: "desc", maxPages: 1});

  const [disabledButton, setDisabledButton] = useState(true);
  const [tamperedWithDialog, setTamperedWithDialog] = useState(false);

  const { ChooseDialogContext } = useContext(ChooseContext);
  const [dialog, setDialog] = ChooseDialogContext;

  const handleAdvancedChange = (e) => {
    setAdvancedForm((prev) => ({...prev, [e.target.name]: e.target.value}))
  }

  const parseParams = async () => {
    var currentParams = searchParams.toString();
    if(currentParams.length === 0 || !carBrands || !carModels || !counties)
      return;

    setTamperedWithDialog(true);

    currentParams = decodeURIComponent(currentParams);

    var paramArray = currentParams.split("&"); 
    var paramObj = {};

    paramArray.forEach((param) => {
      var [key, value] = param.split("=");
      if(value.includes(","))
        paramObj[key] = value.split(",");
      else
        paramObj[key] = value;
    });

    if(!Array.isArray(paramObj.carBrandID))
      paramObj.carBrandID = [paramObj.carBrandID]

    if(!Array.isArray(paramObj.carModelID))
      paramObj.carModelID = [paramObj.carModelID]

    if(!Array.isArray(paramObj.countyID))
    paramObj.countyID = [paramObj.countyID]

    if(!Array.isArray(paramObj.listingType))
    paramObj.listingType = [paramObj.listingType]

    //populate brands from params
    var pusharr = [];
    var checkedFlag = false;

    carBrands.forEach((carBrand) => {
      checkedFlag = false;     
      paramObj.carBrandID.forEach((brand) => {
        if(parseInt(brand) === carBrand.id){
          checkedFlag = true;
          carBrand.checked = true;
          pusharr.push(carBrand);
        }
      });

      if(!checkedFlag)
        pusharr.push(carBrand);
    });

    setCarBrands(pusharr);

    //populate models from params
    var brandModels = [];
    var models = [];
    pusharr.forEach((brand) => {
      models = [];
      carModels.forEach((model) => {
        if(brand.id === model.carBrandID)
          models.push(model)
      });

    brandModels.push({brandName: brand.name, models: models});
    });

    var str = "";
    brandModels.forEach((bm, bmIndex) => {
      bm.models.forEach((m, index) => {
        str = m.id.toString();
        paramObj.carModelID.forEach((paramID) => {
          if(paramID === str)
            bm.models[index].checked = true;
        });
      });
    });

    setCarModelsByCheckedBrands(brandModels);
    
    //populate counties from params
    var newCounties = [];
    var countyFound = false;
    
    counties.forEach((county) => {
      countyFound = false;
      paramObj.countyID.forEach((paramCounty) => {
        if(countyFound)
          return;

        if(county.id === parseInt(paramCounty)){
          countyFound = true;
          newCounties.push({...county, ["checked"]: true});
        }
      });

      if(!countyFound)
        newCounties.push({...county, ["checked"]: false});
    });

    setCounties(newCounties);

    //populate listingTypes from params
    var newTypes = [];
    var typeFound = false;
    listingTypes.forEach((type) => {
      typeFound = false;
      paramObj.listingType.forEach((paramType) => {
        if(typeFound)
          return;

        if(type.id === parseInt(paramType)){
          typeFound = true;
          newTypes.push({...type, ["checked"]: true})
        }
      });

      if(!typeFound)
        newTypes.push({...type, ["checked"]: false})
    });

    setListingTypes(newTypes);

    //set initial values for input fields from params
    var initVals = {};
    for(var objProp in paramObj){
      if(objProp !== "carBrandID" && objProp !== "carModelID" && objProp !== "countyID" && objProp !== "listingType")
        initVals[objProp] = paramObj[objProp]
    }

    setAdvancedForm(initVals);

    //set pagination info from params
    if(paramObj.hasOwnProperty("page") && paramObj.hasOwnProperty("sortBy")){
      var pms = {page: parseInt(paramObj.page), sortBy: paramObj.sortBy}
      setPagination((prev) => {
        pms.maxPages = prev.maxPages;
        return pms;
      })
    }
    else{
      paramObj.page = "1";
      paramObj.sortBy = "desc";
    }

    //search
    await searchListingsByParams(paramObj);
  }

  const openDialog = (dialogType) => {
    setDialog({show: true, type: dialogType});
  }

  const getCarBrands = async () => {
    try{
      const response = await axios({
        method: "GET",
        data: {},
        withCredentials: true,
        url: "http://localhost:8213/getCarBrands"
      });

      return response.data.data;
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
        url: "http://localhost:8213/getCarModels"
      });

      return response.data.data;
    }
    catch (error){
      console.log(error);
    }
  }

  const getCounties = async () => {
    try{
      const response = await axios({
        method: "GET",
        data: {},
        withCredentials: true,
        url: "http://localhost:8213/getCounties"
      });
      
      return response.data.data;
    }catch (error){
      console.error(error);
    }
  }

  const createBrands = async () => {
    var brands = await getCarBrands();
    brands.forEach((brand, index) => {
      brands[index].checked = false;
    });

    setCarBrands(brands);
  }

  const createModels = async () => {
    var models = await getCarModels();
    models.forEach((model, index) => {
      models[index].checked = false;
    });

    setCarModels(models);
  }

  const createCounties = async () => {
    var counties = await getCounties();
    counties.forEach((county, index) => {
      counties[index].checked = false;
    });

    setCounties(counties);
  }

  const getModelsByCheckedBrands = () => {
    var chkdBrands = [];
    var matchingModels = [];

    if(!carBrands)
      return false;

    //if brand-models isn't present in carModelsByCheckedBrands, create it from scratch
    //if brand-models is present, copy it to preserve models' checked state

    //models already been set, update
    if(carModelsByCheckedBrands.length > 0){
      var alreadyExists = false;
      carBrands.forEach((brand) => {
        if(!brand.checked)
          return;

        alreadyExists = false;
        carModelsByCheckedBrands.forEach((model) => {
          //copy if already exists
          if(brand.name === model.brandName){
            alreadyExists = true;
            chkdBrands.push(model);
          }
        });

        //if doesn't exist, create new
        if(!alreadyExists){
          matchingModels = [];
          carModels.forEach((model) => {
            if(model.carBrandID === brand.id){
              model.checked = false;
              matchingModels.push(model);
            }
          });

          chkdBrands.push({brandName: brand.name, models: matchingModels});
        }
      });
    }
    //no models
    else{  
      carBrands.forEach((brand) => {
        matchingModels = [];
        if(!brand.checked)
          return;

        carModels.forEach((model) => {
          if(model.carBrandID === brand.id){
            model.checked = false;
            matchingModels.push(model);
          }
        });

        chkdBrands.push({brandName: brand.name, models: matchingModels});
      });
    }

    setCarModelsByCheckedBrands(chkdBrands);
  }
  
  const handleBrandChange = async (e) => {
    setTamperedWithDialog(true);
    var id = e.target.id;
    var brandsCopy = [];
    var deletedFlag = false;

    carBrands.forEach((brand) => {
      if(brand.id === parseInt(id))
        brandsCopy.push({id: brand.id, name: brand.name, checked: !brand.checked})
      else
        brandsCopy.push(brand)
    });

    setCarBrands(brandsCopy);
  }

  const handleModelsChange = async (e) => {
    setTamperedWithDialog(true);
    var changed = {id: parseInt(e.target.id), parentName: e.target.dataset.parent};
    var modelsCopy = [];
    var helper = [];

    carModelsByCheckedBrands.forEach((models) => {
      if(models.brandName !== changed.parentName){
        modelsCopy.push(models);
        return;
      }

      helper = [];
      models.models.forEach((model) => {
        if(model.id === changed.id)
          helper.push({...model, ["checked"]: !model.checked});
        else
          helper.push(model);
      });

      modelsCopy.push({brandName: models.brandName, models: helper})
    });

    setCarModelsByCheckedBrands(modelsCopy);
  }

  const handleCountyChange = async (e) => {
    setTamperedWithDialog(true);
    var countyID = e.target.id;
    var newCounties = [];
    counties.forEach((county) => {
      if(county.id !== parseInt(countyID)){
        newCounties.push(county);
        return;
      }

      newCounties.push({...county, ["checked"]: !county.checked});
    });

    setCounties(newCounties);
  }

  const handleTypeChange = async (e) => {
    setTamperedWithDialog(true);
    var typeID = e.target.id;
    typeID = typeID.split("-")[1];
    if(isNaN(typeID))
      return;

    var newTypes = [];
    listingTypes.forEach((type) => {
      if(type.id === parseInt(typeID)){
        newTypes.push({...type, ["checked"]: !type.checked});
        return;
      }

      newTypes.push(type);
    });

    setListingTypes(newTypes);
  }

  const disableIfEmpty = () => {
    if(!carBrands)
      return true;

    var flag = true;
    carBrands.forEach((brand) => {
      if(!flag)
        return;

      if(brand.checked)
        flag = false;
    });

    setDisabledButton(flag);
    return flag;
  }

  const handleAdvancedSearch = async (isNewSearch, currentPageID) => {
    var checkedBrands = [];
    var checkedModels = [];
    var checkedCounties = [];
    var checkedListingTypes = [];
    
    carBrands.forEach((brand) => {
      if(brand.checked)
        checkedBrands.push(brand.id);
    });

    carModelsByCheckedBrands.forEach((modelsBrands) => {
      modelsBrands.models.forEach((model) => {
        if(model.checked)
          checkedModels.push(model.id);
      });
    });

    counties.forEach((county) => {
      if(county.checked)
        checkedCounties.push(county.id);
    });

    listingTypes.forEach((type) => {
      if(type.checked)
        checkedListingTypes.push(type.id);
    });

    const params = {
      carBrandID: checkedBrands.toString(),
      carModelID: checkedModels.toString(),
      countyID: checkedCounties.toString(),
      listingType: checkedListingTypes.toString()
    };

    for(var objprop in advancedForm)
      params[objprop] = advancedForm[objprop]

    //if search is triggered from pagination, update params with pagination data
    if(!isNewSearch){
      params.page = currentPageID;
      params.sortBy = pagination.sortBy;
    }
    else{
      params.page = "1";
      params.sortBy = pagination.sortBy;
      setPagination((prev) => {return {page: params.page, sortBy: params.sortBy, maxPages: prev.maxPages} })
    }

    const options = {
      pathname: '/',
      search: `?${createSearchParams(params)}`,
    };

    //getting search data
    await searchListingsByParams(params);

    navigate(options, { replace: true });

  }

  const searchListingsByParams = async (data) => {
    try{
      const response = await axios({
        method: "POST",
        data: data,
        withCredentials: true,
        url: "http://localhost:8213/getListingsFromAdvancedSearch"
      });

      var res = response.data;
      
      if(!res.error && res.data.results.length > 0)
        setSearchedListings({text: null, data: res.data.results});

      if(response.data.data.length === 0)
        setSearchedListings({text: "No results found!", data: []});    

      var totalRows = res.data.totalRows;
      var itemsPerPage = 20;
      var maxPages = totalRows / itemsPerPage;
      if(parseInt(maxPages) === 0 || totalRows === itemsPerPage){
        maxPages = 1;
        setPagination((prev) => {return {...prev, ["maxPages"]: maxPages}})
        return;
      }

      if(maxPages % 1 !== 0)
        maxPages = parseInt(maxPages) + 1;
      
      setPagination((prev) => {return {...prev, ["maxPages"]: maxPages}})
      return;

    }catch (error) {
      console.log(error);
    }
  }




  const handlePaginationClick = async (e) => {
    var currentPageID = e.target.id;
    await handleAdvancedSearch(false, currentPageID)
    setPagination((prev) => {return {...prev, ["page"]: currentPageID}});
  }





  useEffect(() => {
    createBrands();
    createModels();
    createCounties();
  }, []);

  useEffect(() => {
    disableIfEmpty();
    getModelsByCheckedBrands();
  }, [carBrands]);

  useEffect(() => {
    if(carBrands && carModels && counties && !tamperedWithDialog)
      parseParams();
  }, [carBrands, carModels, counties, listingTypes]);

  const sortOptions = [
    {value: "asc", text: "Sort by date (asc)"},
    {value: "desc", text: "Sort by date (desc)"},
    {value: "pAsc", text: "Price (asc)"},
    {value: "pDesc", text: "Price (desc)"}
  ];

  var dval = "";
  sortOptions.forEach((opt) => {
    if(opt.value === pagination.sortBy)
      dval = opt.value;
  });

  return(
  <>
    {dialog.type === "brands" &&
      <ChooseDialog dataToShow={{type: "brands", list: carBrands, handleChange: handleBrandChange, populateModels: getModelsByCheckedBrands}} />
    }

    {dialog.type === "models" &&
      <ChooseDialog dataToShow={{type: "models", list: carModelsByCheckedBrands, handleChange: handleModelsChange}} />
    }

    {dialog.type === "counties" &&
      <ChooseDialog dataToShow={{type: "brands", list: counties, handleChange: handleCountyChange}} />
    }










    <div>
      <div className="advanced-search-container">
        <div className="login-header">
          <div>Search filters</div>
        </div>

        <div className="advanced-search-input">
          <label className="section-name">Brands:</label>
          <div className="section-data">
            <button className="pick-button" type="button" onClick={() => openDialog("brands")}>Pick brands</button><br />
            {carBrands?.map((brand, key) => {
              if(brand.checked)
                return <div className="remove-option" id={brand.id} key={key} onClick={(e) => handleBrandChange(e)}> {brand.name} <span className="remove-x" id={brand.id}>x</span></div>
            })}
          </div>
        </div>

        <div className="advanced-search-input"> 
          <label className="section-name">Models:</label>
          <div className="section-data">
            <button className="pick-button" type="button" onClick={() => openDialog("models")} disabled={disabledButton}>Pick models</button><br />
            {carModelsByCheckedBrands.length > 0 &&
            <>
              {carModelsByCheckedBrands.map((item, key) => {
                var x = item.models.map((model, key) => {
                  if(model.checked)
                    return (<div className="remove-option" id={model.id} key={key} data-parent={model.parentName} onClick={(e) => handleModelsChange(e)}> {model.name} <span className="remove-x" id={model.id} data-parent={model.parentName}>x</span></div>);
                })
                return x;
              })}
            </>
            }
          </div>
        </div> 
        
        <div className="advanced-search-input">
          <label className="section-name">Price:</label>
          <div className="section-data">
            <input type="text" name="priceFrom" value={advancedForm.priceFrom} onChange={(e) => handleAdvancedChange(e)} placeholder="Price from" /> to <input onChange={(e) => handleAdvancedChange(e)} type="text" name="priceTo" placeholder="Price to" value={advancedForm.priceTo} />
          </div>
        </div>

        <div className="advanced-search-input">
          <label className="section-name">Engine power:</label>
          <div className="section-data">
            <input type="text" name="kwFrom" value={advancedForm.kwFrom} onChange={(e) => handleAdvancedChange(e)} placeholder="Engine power (KW)" /> to <input onChange={(e) => handleAdvancedChange(e)} type="text" name="kwTo" placeholder="Engine power (KW)" value={advancedForm.kwTo} />
          </div>
        </div>

        <div className="advanced-search-input">
          <label className="section-name">Production year:</label>
          <div className="section-data">
            <input type="text" name="pYearFrom" value={advancedForm.pYearFrom} onChange={(e) => handleAdvancedChange(e)} placeholder="Produc. year" /> to <input onChange={(e) => handleAdvancedChange(e)} type="text" name="pYearTo" placeholder="Produc. year" value={advancedForm.pYearTo} />
          </div>
        </div>

        <div className="advanced-search-input">
          <label className="section-name">Engine type:</label>
          <div className="section-data">
            <select name="engineType" onChange={(e) => handleAdvancedChange(e)} value={advancedForm.engineType}>
              <option value="0" default>Select engine type</option>
              <option value="1">Diesel</option>
            </select>
          </div>
        </div>

        <div className="advanced-search-input">
          <label className="section-name">Mileage:</label>
          <div className="section-data">
            <input type="text" name="mileageFrom" value={advancedForm.mileageFrom} onChange={(e) => handleAdvancedChange(e)} placeholder="Mileage from (km)" /> to <input onChange={(e) => handleAdvancedChange(e)} type="text" name="mileageTo" placeholder="Mileage to (km)" value={advancedForm.mileageTo} />
          </div>
        </div>

        <div className="advanced-search-input"> 
          <label className="section-name">Counties:</label>
          <div className="section-data">
            <button className="pick-button" type="button" onClick={() => openDialog("counties")}>Choose counties</button><br />
            {counties?.map((county, key) => {
              if(county.checked)
                return <div className="remove-option" id={county.id} key={key} onClick={(e) => handleCountyChange(e)}> {county.name} <span className="remove-x" id={county.id}>x</span></div>
            })}
          </div>
        </div>

        <div className="advanced-search-input">
          <label className="section-name">Listing types:</label>
          <div className="section-data">
            {listingTypes.map((listing, key) => {
              {var x = "type-" + listing.id}
              return (
                <span key={key+listing.id} id={x} onClick={(e) => handleTypeChange(e)}>
                  <input id={x} type="checkbox" checked={listing.checked} onChange={() => ("")}/> {listing.name}
                </span>
              )
            })}
          </div>
        </div>

        <div className="login-footer">
          <button type="button" onClick={() => handleAdvancedSearch(true, null)}>Search</button>
        </div>
      </div>
      

      <div className="main-data-container">
        <div className="results-container">

          {searchedListings.text === null
          ?
          <>
            <ListingContainer listings={searchedListings.data} userInfo={null} handleModalOpen={null} 
              withEdit={{status: false, onEdit: null}} withDelete={{status: false, onDelete: null}} headerText="Results">
            </ListingContainer>
          </>
          :
            <div>{searchedListings.text}</div>
          }

        </div>

        <div className="pagination-container">
          {searchedListings.text === null ?
            <Pagination pagination={pagination} setPagination={setPagination} handleChange={handlePaginationClick} />
          :
            <span></span>
          }
        </div>
      </div>

    </div>
  </>
  );
}

export default Home;