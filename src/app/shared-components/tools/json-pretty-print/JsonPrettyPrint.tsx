import * as React from 'react';
import "./JsonPrettyPrint.scss";

interface Props {
    onClose: () => void;
}

export const JsonPrettyPrint:React.FunctionComponent<Props> = (props) => {

    const [source, setSource] = React.useState("");
    const [destination, setDestination] = React.useState("");

    const onSourceChange = (value:string) => {

        setSource(value);

        try {
            const pretty = JSON.stringify(JSON.parse(value), null, 2); 

            setDestination(pretty);
        } catch(e) {

        }
    }

    return <div className="json-pretty-print">
        <i className="bi bi-x-circle clickable" onClick={props.onClose}></i>
        <h3>Json Pretty Print</h3>
        <div className="row pretty-container">
            <div className="col-sm-6">
                <div><label>Source</label></div>
                <textarea className="form-control" value={source} onChange={e => onSourceChange(e.target.value)}/>
            </div>
            <div className="col-sm-6">
                <div><label>Pretty</label></div>
                <textarea className="form-control" value={destination} readOnly={true}/>
            </div>
        </div>
        <div className="row">
            <div className="col-sm-12">
                <button className="btn btn-danger pull-right" onClick={props.onClose}>Close&nbsp;<i className="bi bi-x"></i></button>
            </div>
        </div>
    </div>
}