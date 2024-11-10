import { useQuery } from "react-query";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import {
  getSearchMovieKeyword,
  IGetSearchMovieKeywordResults,
} from "../searchApi";
import styled from "styled-components";
import { useState } from "react";
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { makeImagePath } from "../utils";

const Wrapper = styled.div`
  background-color: black;
  margin-top: 100px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  text-align: center;
`;

const Info = styled(motion.div)`
  padding: 10px;
  opacity: 0;
  position: absolute;
  width: auto;
  bottom: 0;
  background-color: ${(props) => props.theme.black.lighter};
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const GridContainer = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, 1fr);
  row-gap: 50px;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
  background-color: white;
  height: 200px;
  font-size: 66px;
  background-image: url(${(props) => props.bgphoto});
  background-position: center;
  background-size: cover;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

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

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

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

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const { data: searchMovieData, isLoading: searchMovieLoading } =
    useQuery<IGetSearchMovieKeywordResults>(["movie", keyword], () =>
      getSearchMovieKeyword(keyword)
    );

  /* index system */
  const [index, setIndex] = useState(0);
  let offset = searchMovieData?.results.length!;
  const [leaving, setLeaving] = useState(false);
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const incraseIndex = () => {
    if (searchMovieData) {
      if (leaving) return;
      toggleLeaving();
      const totalResults = searchMovieData?.results.length;
      const maxIndex = Math.ceil(totalResults / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const history = useHistory();

  const checkSearchResultMatch = useRouteMatch<{
    movieId: string;
    keyword: string;
  }>("/search/movie/:movieId");

  const onBoxClicked = (movieId: number) => {
    history.push(`/search/movie/${movieId}?keyword=${keyword}`);
  };

  const onOverlayClick = () => history.goBack();

  const { scrollY } = useViewportScroll();

  const clickedSearchResultMovieBox =
    checkSearchResultMatch?.params.movieId &&
    searchMovieData?.results.find(
      (movie) => movie.id === +checkSearchResultMatch.params.movieId
    );
  console.log(clickedSearchResultMovieBox);

  return (
    <Wrapper>
      <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
        <Title
          style={{
            fontSize: "48px",
            fontWeight: 600,
            paddingLeft: "60px",
          }}
        >
          {keyword} Results
        </Title>
        {searchMovieLoading ? (
          <Loader>Loading</Loader>
        ) : (
          <GridContainer key={index}>
            {searchMovieData?.results
              .slice(offset * index, offset * index + offset)
              .map((movie) => (
                <Box
                  key={movie.id}
                  layoutId={movie.id + ""}
                  variants={BoxVariants}
                  onClick={() => onBoxClicked(movie.id)}
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
          </GridContainer>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {checkSearchResultMatch ? (
          <>
            <Overlay
              onClick={onOverlayClick}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <InfoCenterBox
              style={{ top: scrollY.get() + 100 }}
              layoutId={checkSearchResultMatch?.params.movieId + ""}
            >
              {clickedSearchResultMovieBox && (
                <>
                  <InfoCenterImg
                    bgphoto={makeImagePath(
                      clickedSearchResultMovieBox.backdrop_path,
                      "w500"
                    )}
                  ></InfoCenterImg>
                  <InfoCenterTitle>
                    {clickedSearchResultMovieBox.title}
                  </InfoCenterTitle>
                  <InfoOverView>
                    {clickedSearchResultMovieBox.overview}
                  </InfoOverView>
                </>
              )}
            </InfoCenterBox>
          </>
        ) : null}
      </AnimatePresence>
    </Wrapper>
  );
}

export default Search;
