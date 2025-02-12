import {
  Box,
  Typography,
  Paper,
  Slider,
  Skeleton,
  Button,
  Checkbox,
  FormControlLabel,
  Popover,
  Dialog,
  IconButton,
} from "@mui/material";
import { Canvas, ObjectMap } from "@react-three/fiber";
import Model from "./Model";
import { useCallback, useState } from "react";
import { IVideo } from "../interface/type";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import { GLTF } from "three/examples/jsm/Addons.js";
import MouseOutlinedIcon from "@mui/icons-material/MouseOutlined";

export default function PreviewPanel(props: {
  _id: string | undefined;
  vidData: IVideo | undefined;
  model: GLTF & ObjectMap;
}) {
  const [time, setTime] = useState(0);
  const [isPlay, setIsPlay] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(0);
  const [isOrbitControl, setOrbitControl] = useState<boolean>(false);
  const [exportCanvasRef, setExportCanvasRef] =
    useState<HTMLCanvasElement | null>(null);
  const [openFullScreen, setOpenFullScreen] = useState(false);

  // nút play
  const playHandler = () => {
    setIsPlay(!isPlay);
  };

  // xử lí timeline
  const timelineHandler = (_event: Event, newValue: number | number[]) => {
    setTime(newValue as number);
  };

  //format thời gian
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const decreaseTime = useCallback(() => {
    setTime((prevTime) => Math.max(prevTime - 0.05, 0)); // Đảm bảo không âm
  }, []);

  const increaseTime = useCallback(() => {
    setTime((prevTime) => prevTime + 0.05);
  }, []);

  //PopOver của checkbox
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  // SIÊU XUẤT

  const exportVideo = () => {

    const canvas = document.getElementById("canvas")?.children[0].children[0] as HTMLCanvasElement;
    
    const stream = canvas.captureStream(30) as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded-video.webm";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    setTime(0);

    mediaRecorder.start();
    console.log("Recording started, will stop after:", duration, "seconds");

    setTimeout(() => {
      mediaRecorder.stop();
      console.log("Recording stopped.");
    }, duration * 1000);
  };

  return (
    <>
      <Button
        onClick={() => {
          setOpenFullScreen(true); // Mở Dialog trước
          setTimeout(() => {
            exportVideo(); // Gọi export sau khi Dialog mở
          }, 1000); // Chờ 0.5s để đảm bảo render
        }}
      >
        export
      </Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100vh",
          height: "56.25vh",
          padding: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5px",
          }}
        >
          <Typography variant="h5">{props.vidData?.title}</Typography>
          <FormControlLabel
            label="Orbit contol"
            control={
              <Checkbox
                onChange={() => setOrbitControl((prev) => !prev)}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              />
            }
          />
        </Box>

        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1e1e1e",
            borderRadius: 2,
            overflow: "hidden", // Ensures the canvas fits within the Paper
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)", // Shadow for depth
          }}
        >
          {props.vidData ? (
            <>
              <Canvas
                gl={{ preserveDrawingBuffer: true }}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000",
                }}
              >
                <Model
                  _id={props.vidData?._id}
                  model={props.model}
                  isPlay={isPlay}
                  time={time}
                  setTime={setTime}
                  setDuration={setDuration}
                  isOrbitControl={isOrbitControl}
                />
              </Canvas>
              <Dialog
                fullScreen
                open={openFullScreen}
                onClick={() => setOpenFullScreen(false)}
              >
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setOpenFullScreen(false)}
                  aria-label="close"
                  sx={{ position: "absolute", top: 10, right: 10 }}
                ></IconButton>

                <Canvas
                  id="canvas"
                  gl={{ preserveDrawingBuffer: true }}
                  style={{
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "#000",
                  }}
                >
                  <Model
                    _id={props.vidData?._id}
                    model={props.model}
                    isPlay={isPlay}
                    time={time}
                    setTime={setTime}
                    setDuration={setDuration}
                    isOrbitControl={isOrbitControl}
                  />
                </Canvas>
              </Dialog>
            </>
          ) : (
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={1920}
              height={1920}
            />
          )}
        </Paper>

        <Typography variant="body1" sx={{ marginTop: 2, textAlign: "center" }}>
          Suc vat bien ©2025
        </Typography>
      </Box>

      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: " 60vh ", display: "flex", alignItems: "center" }}>
          <Typography marginRight={2}>{formatTime(0)}</Typography>
          {isPlay ? (
            <Slider min={0} max={duration} step={0.01} value={time} disabled />
          ) : (
            <Slider
              min={0}
              max={duration}
              step={0.01}
              value={time} // Nếu đang kéo, hiển thị seekTime; nếu không thì time
              onChange={timelineHandler}
            />
          )}
          <Typography marginLeft={2}> {formatTime(duration)} </Typography>
        </Box>

        <Box>
          <Button onClick={decreaseTime}>
            <KeyboardDoubleArrowLeftRoundedIcon />
          </Button>
          <Button onClick={playHandler}>
            {isPlay ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          </Button>
          <Button onClick={increaseTime}>
            <KeyboardDoubleArrowRightRoundedIcon />
          </Button>
        </Box>
        <Popover
          id="mouse-over-popover"
          sx={{ pointerEvents: "none" }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>
            <MouseOutlinedIcon /> HOLD <br></br>
            <b>leftclick:</b> move around <br></br>
            <b>rightclick:</b> move camera
          </Typography>
        </Popover>
      </Box>
    </>
  );
}
