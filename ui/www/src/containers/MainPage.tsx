import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Canvas from "../components/Canvas/Canvas";
import StepsContainer from "../components/Stepper/StepsContainer";
import useDrawingStore from "../hooks/useDrawingStore";
import useStepperStore from "../hooks/useStepperStore";

const MainPage = () => {
  const history = useHistory();
  const { uuid } = useDrawingStore();
  const { currentStep } = useStepperStore();
  return (
    <div className="main-content bg-main">
      <div className="navbar-title">
        <a href="/">
          <h2 className="mb-3">
            ANIMATED <span className="text-info">DRAWINGS</span>
          </h2>
        </a>
      </div>
      <a
        href={`mailto:animatingdrawingsfb@gmail.com?subject=Questions%20or%20Feedback&body=Please%20include%20the%20following%20ID%20in%20your%20message.%0AUUID:%20${
          uuid !== "" ? uuid : "Preload_Step"
        }`}
        target="_blank"
        rel="noreferrer"
      >
        <div className="feedback-wrapper">
          <h4 className="d-none d-lg-block">
            Feedback <i className="bi bi-info-square-fill ml-2 h2"></i>
          </h4>
          <i className="bi bi-info-square-fill h2 d-inline-block d-block d-sm-none" />
        </div>
      </a>
      <div className="main-page">
        <Container>
          <Row className="align-items-center py-2 px-lg-2">
            <Col
              lg={6}
              md={12}
              xs={12}
              className="mb-2 order-sm-2 justify-content-center"
            >
              <Canvas />
            </Col>
            <Col
              lg={5}
              md={10}
              xs={12}
              className="col-left ml-auto mr-auto mt-sm-6 align-self-start px-3 order-sm-1 pt-md-4"
            >
              <StepsContainer />
            </Col>
          </Row>
        </Container>
        {currentStep === 5 && (
          <>
            <div className="home-footer-credits py-2">
              <h4>
                <span className="rg-1">Presented By</span> FACEBOOK AI{" "}
                <span className="rg-1">Research</span>
              </h4>
            </div>
            <div
              className="home-footer d-none d-lg-block text-center py-2"
              onClick={() => history.push("/about")}
            >
              <h4>ABOUT THIS DEMO</h4>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainPage;
