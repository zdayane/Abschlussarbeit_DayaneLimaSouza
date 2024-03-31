import { Spinner } from "react-bootstrap";

export default function Loading() {
  return (
    <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
        <Spinner id='spinner' placeholder="Loading..." animation="grow" className="super-colors"/> 
        <Spinner id='spinner' animation="grow" className="super-colors"/> 
        <Spinner id='spinner' animation="grow" className="super-colors"/> 
    </div>
)
}
