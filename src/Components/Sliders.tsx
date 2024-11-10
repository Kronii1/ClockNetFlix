import { useQuery } from "react-query";
import { getScreenMovies, IGetScreenMoviesResult } from "../api";
import styled from "styled-components";
import { motion } from "framer-motion";

const Slider = styled.div``;

const Row = styled(motion.div)``;

function Sliders() {
  const { data, isLoading } = useQuery<IGetScreenMoviesResult>(
    ["movies", "nowPlaying"],
    getScreenMovies
  );
  return null;
}

export default Sliders;
