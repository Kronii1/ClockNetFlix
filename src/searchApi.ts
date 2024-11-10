const API_KEY = "4372159b7aeb3bdaa115f639251b1e0c";
const BASE_PATH = "https://api.themoviedb.org/3";

export async function getSearchMovieKeyword(keyword: any) {
  return await fetch(
    `${BASE_PATH}/search/movie?api_key=${API_KEY}&&query=${keyword}`
  ).then((response) => response.json());
}

interface ISearchMovieKeywordResults {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
}

export interface IGetSearchMovieKeywordResults {
  results: ISearchMovieKeywordResults[];
}
