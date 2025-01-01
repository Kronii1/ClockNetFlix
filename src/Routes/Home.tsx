import { useQuery } from "react-query";
import {
  getLatestMoives,
  getRatedMovies,
  getScreenMovies,
  getUpComingMovies,
  IGetLatestMoviesResult,
  IGetScreenMoviesResult,
  IGetUpcomingMoviesResult,
} from "../api";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { FaAngleRight, FaChevronLeft } from "react-icons/fa6";
import useWindowDimensions from "../Components/useWidowDimensions";

const Wrapper = styled.div`
  background-color: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  text-align: center;
`;

const Banner = styled.div<{ bgphoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url(${(props) => props.bgphoto});
  background-size: cover;
  padding: 60px;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 30px;
  width: 50%;
`;

{
  /* Slider */
}
const Slider = styled.div`
  position: relative;
  top: -100px;
`;

const Slider2 = styled(Slider)`
  top: 200px;
`;

const Slider3 = styled(Slider)`
  top: 500px;
`;
const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
  background-color: white;
  height: 200px;
  font-size: 66px;
  background-image: url(${(props) => props.bgphoto});
  background-size: cover;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px 0px;
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  background-color: ${(props) => props.theme.black.lighter};
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

/* 슬라이더 영화 박스를 클릭했을 때 Overlay와 함께오는 가운데 info Box */
const InfoCenterBox = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const InfoCenterImg = styled.div<{ bgphoto: string }>`
  width: 100%;
  height: 400px;
  background-image: linear-gradient(to top, black, transparent),
    url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center center;
`;

const InfoCenterTitle = styled.h3`
  position: relative;
  top: -60px;
  padding: 10px;
  font-size: 36px;
  color: ${(props) => props.theme.white.lighter};
`;

const InfoOverView = styled.p`
  position: relative;
  padding: 20px;
  top: -50px;
  color: ${(props) => props.theme.white.lighter};
`;

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      type: "tween",
      duration: 0.3,
    },
  },
};

/* Slider setting var */
const offset = 6;

const BoxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.5,
      type: "tween",
      duration: 0.3,
    },
  },
};

const ArrowsVariants = {
  normal: { scale: 1, opacity: 0.6 },
  hover: { scale: 1.3, opacity: 1 },
};

const SliderRight = styled(motion.div)`
  opacity: 0.6;
  position: absolute;
  z-index: 1;
  width: 3vw;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 0;
  font-size: 36px;
`;

const SliderLeft = styled(SliderRight)`
  left: 0;
`;

function Home() {
  const { data, isLoading } = useQuery<IGetScreenMoviesResult>(
    ["movies", "nowPlaying"],
    getScreenMovies
  );

  /* top Rated function */
  const { data: ratedData, isLoading: ratedLoading } =
    useQuery<IGetScreenMoviesResult>(["movies", "topRated"], getRatedMovies);

  /* Up Coming function */
  const { data: upcomingData, isLoading: upcomingLoading } =
    useQuery<IGetUpcomingMoviesResult>(
      ["movies", "upComing"],
      getUpComingMovies
    );

  /* Latest Function */
  const { data: latestData, isLoading: latestLoading } =
    useQuery<IGetLatestMoviesResult>(["movies", "latest"], getLatestMoives);

  /* index system */
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const incraseIndex = () => {
    if (ratedData) {
      if (leaving) return;
      toggleLeaving();
      /*
        슬라이더의 영화정보가 한정적이기 때문에 그것에 대한 정보 남기기 
        incraseIndex는 ratedData의 배열길이를 확인 후
        maxIndex에 offset의 변수를 나누어
        총 몇장의 슬라이더 장수가 나오는지 확인하는 역할을 한다.
        그래서 setIndex에서 prev === maxIndex
        즉, 현재 index값이 maxIndex값 (슬라이더의 최대장수)와 같으면
        0으로 초기화 그렇지 않을 경우 prev현재값의 + 1 을 해주는 역할을 함.
      */
      const totalMovies = ratedData?.results.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const leftIncraseIndex = () => {
    if (ratedData) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = ratedData?.results.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const [upcomingIndex, setUpcomingIndex] = useState(0);
  const upcomingIncraseIndex = () => {
    if (upcomingData) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = upcomingData?.results.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setUpcomingIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const upcomingLeftIncraseIndex = () => {
    if (upcomingData) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = upcomingData?.results.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setUpcomingIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const [latestIndex, setLatestIndex] = useState(0);
  const latestIncraseIdex = () => {
    if (latestData) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = latestData?.results.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setLatestIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const latestLeftIncraseIndex = () => {
    if (upcomingData) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = upcomingData?.results.length;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      setLatestIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);

  {
    /* Box Info Function */
  }

  {
    /* useHistory url을 왔다 갔다 하는 역할 */
  }
  const history = useHistory();

  const checkMovieMatch = useRouteMatch<{ movieId: string }>(
    "/movies/:movieId"
  );

  const onBoxClicked = (movieId: number) => {
    history.push(`/movies/${movieId}`);
  };

  {
    /* scroll 위치를 알 수 있음 */
  }
  const { scrollY } = useViewportScroll();

  {
    /* Overlay Click Function */
  }
  const onOverlayClick = () => history.goBack();

  /* 
    슬라이더 안에 영화박스를 클릭 했을 때
    처음으로 checkMovieMatch?.params.movieId
    클릭했던 영화박스의 url에 movieId가 존재하는지 확인하고
    
    두번째로 ratedData?.results에서 find함수를 사용하여
    받아오는 모든 영화 데이터중에서
    checkMovieMatch.params.movieId와 같은
    영화를 찾도록 하는 함수이다.
  */
  const clickedMovieBox =
    checkMovieMatch?.params.movieId &&
    ratedData?.results.find(
      (movie) => movie.id === +checkMovieMatch.params.movieId
    );
  console.log(clickedMovieBox);

  /* Upcoming과 url 영화 일치 함수 */
  const clickedUpcomingMovieBox =
    checkMovieMatch?.params.movieId &&
    upcomingData?.results.find(
      (movie) => movie.id === +checkMovieMatch.params.movieId
    );

  /* Latest와 url 영화 일치 함수 */

  const clickedLatestMovieBox =
    checkMovieMatch?.params.movieId &&
    latestData?.results.find(
      (movie) => movie.id === +checkMovieMatch.params.movieId
    );
  {
    /* 
      Check To Do 
      각 영화 슬라이더 종류마다 Match함수를 사용하여 각자 id를 확인해주는 함수를 제작 후
      animationpresence 적용 시켜보기

      상자를 영화와 매칭시키기 위해서는
      첫번째로 history함수를 통해 영화박스를 클릭 했을 때
      해당 영화 고유 id를 history.push를 통해 url로 넣어주고
      match 함수를 통해 해당영화의 id 와 url이 같은지 확인 후
      layoutId를 통해 infoBox랑 영화슬라이더 박스랑 연결시켜주기
    */
  }

  const width = useWindowDimensions();

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner bgphoto={makeImagePath(data?.results[4].backdrop_path || "")}>
            <Title>{data?.results[4].title}</Title>
            <Overview>{data?.results[4].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Title
                style={{
                  fontSize: "48px",
                  fontWeight: 600,
                  paddingLeft: "60px",
                }}
              >
                Popular on Netflix
              </Title>
              {ratedLoading ? (
                <Loader>Loading</Loader>
              ) : (
                <Row
                  initial={{ x: width + 10 }}
                  animate={{ x: 0 }}
                  exit={{ x: -width - 10 }}
                  transition={{ type: "tween", duration: 1 }}
                  key={index}
                >
                  <SliderLeft
                    variants={ArrowsVariants}
                    initial="normal"
                    whileHover="hover"
                    onClick={leftIncraseIndex}
                  >
                    <FaChevronLeft />
                  </SliderLeft>
                  <SliderRight
                    variants={ArrowsVariants}
                    initial="normal"
                    whileHover="hover"
                    onClick={incraseIndex}
                  >
                    <FaAngleRight />
                  </SliderRight>
                  {ratedData?.results
                    .slice(offset * index, offset * index + offset)
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""}
                        onClick={() => onBoxClicked(movie.id)}
                        key={movie.id}
                        variants={BoxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        bgphoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              )}
            </AnimatePresence>
          </Slider>

          <Slider2>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Title
                style={{
                  fontSize: "48px",
                  fontWeight: 600,
                  paddingLeft: "60px",
                }}
              >
                Up Coming on Netflix
              </Title>
              {upcomingLoading ? (
                <Loader>Loading</Loader>
              ) : (
                <Row
                  initial={{ x: width + 10 }}
                  animate={{ x: 0 }}
                  exit={{ x: -width - 10 }}
                  transition={{ type: "tween", duration: 1 }}
                  key={upcomingIndex}
                >
                  <SliderLeft
                    variants={ArrowsVariants}
                    initial="normal"
                    whileHover="hover"
                    onClick={upcomingLeftIncraseIndex}
                  >
                    <FaChevronLeft />
                  </SliderLeft>
                  <SliderRight
                    variants={ArrowsVariants}
                    initial="normal"
                    whileHover="hover"
                    onClick={upcomingIncraseIndex}
                  >
                    <FaAngleRight />
                  </SliderRight>
                  {upcomingData?.results
                    .slice(
                      offset * upcomingIndex,
                      offset * upcomingIndex + offset
                    )
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""}
                        onClick={() => onBoxClicked(movie.id)}
                        key={movie.id}
                        variants={BoxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        bgphoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              )}
            </AnimatePresence>
          </Slider2>

          <Slider3>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Title
                style={{
                  fontSize: "48px",
                  fontWeight: 600,
                  paddingLeft: "60px",
                }}
              >
                Latest on Netflix
              </Title>
              {latestLoading ? (
                <Loader>Loading</Loader>
              ) : (
                <Row
                  initial={{ x: width + 10 }}
                  animate={{ x: 0 }}
                  exit={{ x: -width - 10 }}
                  transition={{ type: "tween", duration: 1 }}
                  key={latestIndex}
                >
                  <SliderLeft
                    variants={ArrowsVariants}
                    initial="normal"
                    whileHover="hover"
                    onClick={latestLeftIncraseIndex}
                  >
                    <FaChevronLeft />
                  </SliderLeft>
                  <SliderRight
                    variants={ArrowsVariants}
                    initial="normal"
                    whileHover="hover"
                    onClick={latestIncraseIdex}
                  >
                    <FaAngleRight />
                  </SliderRight>
                  {latestData?.results
                    .slice(offset * latestIndex, offset * latestIndex + offset)
                    .map((movie) => (
                      <Box
                        layoutId={movie.id + ""}
                        onClick={() => onBoxClicked(movie.id)}
                        key={movie.id}
                        variants={BoxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        bgphoto={makeImagePath(movie.backdrop_path, "w500")}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              )}
            </AnimatePresence>
          </Slider3>

          <AnimatePresence>
            {checkMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                {/* 
                  To Do
                  motion.div을 component로 구현해보기
                  API로 부터 정보를 얻어오는 컴포넌트로 render해보기
                */}
                <InfoCenterBox
                  /* 
                    motion value는 특별하기 때문에
                    그냥 top: scrollY + 100으로는 사용할 수 가 없음
                    그래서 get() 함수를 사용 후 원하는 크기만큼 더해주면 된다.
                  */
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={checkMovieMatch.params.movieId + ""}
                >
                  {/* TopRated 박스 클릭 및 영화 id 일치 확인 조건문 */}
                  {clickedMovieBox && (
                    <>
                      <InfoCenterImg
                        bgphoto={makeImagePath(
                          clickedMovieBox.backdrop_path,
                          "w500"
                        )}
                      ></InfoCenterImg>
                      <InfoCenterTitle>{clickedMovieBox.title}</InfoCenterTitle>
                      <InfoOverView>{clickedMovieBox.overview}</InfoOverView>
                    </>
                  )}
                  {/* Upcoming 박스 클릭 및 영화 id 일치 확인 조건문 */}
                  {clickedUpcomingMovieBox && (
                    <>
                      <InfoCenterImg
                        bgphoto={makeImagePath(
                          clickedUpcomingMovieBox.backdrop_path,
                          "w500"
                        )}
                      ></InfoCenterImg>
                      <InfoCenterTitle>
                        {clickedUpcomingMovieBox.title}
                      </InfoCenterTitle>
                      <InfoOverView>
                        {clickedUpcomingMovieBox.overview}
                      </InfoOverView>
                    </>
                  )}
                  {/* Latest 박스 클릭 및 영화 id 일치 확인 조건문 */}
                  {clickedLatestMovieBox && (
                    <>
                      <InfoCenterImg
                        bgphoto={makeImagePath(
                          clickedLatestMovieBox.backdrop_path,
                          "w500"
                        )}
                      ></InfoCenterImg>
                      <InfoCenterTitle>
                        {clickedLatestMovieBox.title}
                      </InfoCenterTitle>
                      <InfoOverView>
                        {clickedLatestMovieBox.overview}
                      </InfoOverView>
                    </>
                  )}
                </InfoCenterBox>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
