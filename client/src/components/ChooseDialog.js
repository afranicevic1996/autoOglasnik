import { useState, useContext, useEffect } from "react";
import { ChooseContext } from "./contexts/ChooseContext";
import "../css/ChooseDialog.css";

const ChooseDialog = (props) => {
  const items = props.dataToShow;
  const { ChooseDialogContext } = useContext(ChooseContext);
  const [dialog, setDialog] = ChooseDialogContext;
  const [searchedValues, setSearchedValues] = useState({search: false, term: ""});
  const [checkedStuff, setCheckedStuff] = useState();
  const [toPrintSearch, setToPrintSearch] = useState();

  const dialogBodyStyle = {
    padding: "5px 10px",
    textAlign: "left"
  }

  const brandNameStyle = {
    border: "1px solid black",
    marginBottom: "4px"
  }

  const chckbx = {
    cursor: "pointer"
  }

  const closeDialog = () => {
    //if(dialog.type === "brands")
    //  items.populateModels();

    setDialog({show: false, type: ""});
  }

  const searchData = (e) => {
    var val = e.target.value;
    if(val === ""){
      setSearchedValues({search: false, term: ""});
      return false;
    }

    setSearchedValues({search: true, term: val});
  }

  const checkedBox = async () => {
    var checkedStuff = [];

    if(dialog.type === "brands" || dialog.type === "counties"){
      items.list.forEach(element => {
        if(element.checked)
          checkedStuff.push(element)
      });
    }

    if(dialog.type === "models"){
      items.list.forEach(element => {
        element.models.forEach(model => {
          if(model.checked)
            checkedStuff.push(model)
        });
      });
    }

    setCheckedStuff(checkedStuff);
  }

  const toPrint = () => {
    var searchKeyword = searchedValues.term;
    var toPrint = [];
    var temp = [];
    var flag = false;
    items.list.forEach((item) => {
      flag = false;
      temp = [];
      item.models.forEach((elem) => {
        if(elem.name.substring(0, searchKeyword.length).toLowerCase() === searchKeyword){
          flag = true;
          temp.push(elem);
        }
      });

      if(flag)
        toPrint.push({brandName: item.brandName, models: temp})
    });

    setToPrintSearch(toPrint);
  }

  useEffect(() => {checkedBox()}, [items])

  useEffect(() => {
    if(searchedValues.search && dialog.type === "models")
      toPrint();
  }, [searchedValues.search, items.list, searchedValues.term])

  return (
  <>
    {dialog.show &&
      <div className="dialog-box">
        <div className="dialog-content">

          <div className="dialog-header">
            <button className="dialog-box-button" onClick={closeDialog}>Done!</button>
            <div className="dialog-search">
              <input type="text" placeholder="Search..." onChange={(e) => {searchData(e)}} />
            </div>

            <div>&nbsp;
              {checkedStuff &&
                checkedStuff.map((el, key) => 
                  <div className="remove-option" key={key} id={el.id} data-parent={el.parentName} onClick={(e) => items.handleChange(e)} >{el.name} <span className="remove-x" id={el.id} data-parent={el.parentName}>x</span></div>
                )
              }
            </div>
          </div>
          
          {/* BRANDS/COUNTIES BODY SECTION */}
          {(dialog.type === "brands" || dialog.type === "counties") &&
            <div style={dialogBodyStyle}>
              {searchedValues.search === true
              ?
              <>
                {items.list.map((el, key) => {
                  if(el.name.substring(0, searchedValues.term.length).toLowerCase() === searchedValues.term){
                    var classesToAdd = el.checked ? "item-box checked-box" : "item-box";
                    return (
                      <div key={key} id={el.id} onClick={(e) => items.handleChange(e)} className={classesToAdd}>
                        {el.name}
                        {el.checked === true
                        ?
                          <input style={chckbx} type="checkbox"  id={el.id} checked={true} onChange={() => ("")} />
                        :
                          <input style={chckbx} type="checkbox"  id={el.id} checked={false} onChange={() => ("")} />
                        }
                      </div>
                    )
                  }
                })}
              </>
              :
                items.list.map((el, key) => {
                  var classesToAdd = el.checked ? "item-box checked-box" : "item-box";
                  return (
                    <div key={key} id={el.id} onClick={(e) => items.handleChange(e)} className={classesToAdd}>
                      {el.name}
                      {el.checked === true
                      ?
                        <input style={chckbx} type="checkbox"  id={el.id} checked={true} onChange={() => ("")} />
                      :
                        <input style={chckbx} type="checkbox"  id={el.id} checked={false} onChange={() => ("")} />
                      }
                    </div>
                  )
                })}
            </div>          
          }

          {/* MODELS BODY SECTION */}
          {dialog.type === "models" &&
            <div style={dialogBodyStyle}>
              {searchedValues.search === true
              ?
              <>
                {toPrintSearch?.map((el, key) =>
                  <>
                    <div key={"sname"+key} className="header-item-box" >{el.brandName}</div>

                    {el.models.map((elem, key2) => {
                      var classesToAdd = elem.checked ? "item-box checked-box" : "item-box";

                      return (
                        <div key={"sbodydiv"+key2} id={elem.id} data-parent={elem.parentName} onClick={(e) => items.handleChange(e)} className={classesToAdd}>
                          {elem.name}
                          {elem.checked === true
                          ?
                            <input key={"sinp"+key2} style={chckbx} type="checkbox"  id={elem.id} data-parent={elem.parentName} checked={true} onChange={() => ("")} />
                          :
                            <input key={"sinp"+key2} style={chckbx} type="checkbox"  id={elem.id} data-parent={elem.parentName} checked={false} onChange={() => ("")} />
                          }
                        </div>     
                      )               
                    })}
                  </>
                )}
              </>
              :
                items.list.map((el, key) =>
                  <>
                    <div key={"name"+key} className="header-item-box" >{el.brandName}</div>

                    {el.models.map((elem, key2) => {
                      var classesToAdd = elem.checked ? "item-box checked-box" : "item-box";

                      return (
                        <div key={"bodydiv"+key2} id={elem.id} data-parent={elem.parentName} onClick={(e) => items.handleChange(e)} className={classesToAdd}>
                          {elem.name}
                          {elem.checked === true
                          ?
                            <input key={"inp"+key2} style={chckbx} type="checkbox"  id={elem.id} data-parent={elem.parentName} checked={true} onChange={() => ("")} />
                          :
                            <input key={"inp"+key2} style={chckbx} type="checkbox"  id={elem.id} data-parent={elem.parentName} checked={false} onChange={() => ("")} />
                          }
                        </div>
                      )
                    })}
                  </>
                )}
            </div>
          }
        </div>
      </div>

    }

  </>
  )
}

export default ChooseDialog