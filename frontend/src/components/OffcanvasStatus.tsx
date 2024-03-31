import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { NewsResource } from '../BoardResources';
import Status from './Status';

interface OffcanvasStatusProps {
  open: boolean;
  handleClose: () => void;
  currentNews: NewsResource | null;
  boardId: string;
}
function OffcanvasStatus(
  { open, handleClose, currentNews, boardId}: OffcanvasStatusProps,
) {

  return (
    <>
      <Offcanvas show={open} onHide={handleClose} backdrop="true" placement={"end"}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select an option</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {currentNews && <Status currentNews={currentNews} boardID={boardId} />}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default OffcanvasStatus;