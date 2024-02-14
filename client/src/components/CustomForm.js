import {Formik, Form, Field, ErrorMessage} from "formik";

const CustomForm = (props) => {
  //enableReinitialize={true}
  //sa ovim se resetaju values u formi nakon modal show

  return(
    <>

   

      <Formik  initialValues={props.initialValues} onSubmit={props.handleSubmit} validationSchema={props.validationSchema}>
        <Form id={props.formID}>


          {props.inputFields.map((element, key) =>
            element.type !== "select"
            ?
            <>
              <label>{element.labelInfo}</label>
              <ErrorMessage name={element.name} component="span" />
              <Field id={element.name} type={element.type} name={element.name} />
              <br />
            </>
            :
            <>
              <label>{element.labelInfo}</label>
              <ErrorMessage name={element.name} component="span" />
              <Field name={element.name} as="select">
                  {!element.hasInitialValue &&
                    <option value="default">Unesite opciju</option>
                  }

                  {element.options.map((el) =>
                    <option value={el.id}>{el.name}</option>
                  )}
              </Field>
              <br />
            </>
          )}

          {props.withModal 
            ?
              <button type="button" id={props.formID} onClick={(e) => {props.handleModalOpen(e, props.modalText, true)}}>{props.buttonName}</button>
            :
              <button type="submit">{props.buttonName}</button>
          }
        </Form>
      </Formik>

    </>
  );
}

export default CustomForm;