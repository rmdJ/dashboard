import { Col, Row, Typography } from "antd";
import { Movie } from "@/technical/types";
import { CinemaCard } from "../ui/cinemaCard";
import HorizontalScroll from "@/components/layout/horizontalScroll";
import useIsMobile from "@/technical/hooks/useIsMobile";

const { Text } = Typography;

export const LayoutCinema = ({
  cinema,
  shouldFilterChildrenMovies,
  onPosterClick,
  selectedMovies,
  handleMovieSelection,
}: {
  cinema: {
    cinemaName: string;
    movies: Movie[];
  };
  shouldFilterChildrenMovies: boolean;
  onPosterClick: (movie: Movie) => void;
  selectedMovies: Movie[];
  handleMovieSelection: (movie: Movie) => void;
}) => {
  const { isMobile } = useIsMobile();

  const filteredMovies = cinema.movies.filter(
    (movie) =>
      !shouldFilterChildrenMovies ||
      movie.relatedTags.some((tag) => tag.name.startsWith("À partir de"))
  );

  const renderMovies = () => {
    if (filteredMovies.length === 0) {
      return (
        <Col span={24}>
          <Text>Aucun film programmé pour le moment</Text>
        </Col>
      );
    }

    const movieCards = filteredMovies.map((movie) => (
      <CinemaCard
        key={`${movie.cinemaName}_${movie.internalId}`}
        movie={movie}
        onPosterClick={onPosterClick}
        onSelectMovie={handleMovieSelection}
        isMovieSelected={selectedMovies.some(
          (selectedMovie) =>
            selectedMovie.internalId === movie.internalId &&
            selectedMovie.cinemaName === movie.cinemaName
        )}
      />
    ));

    if (isMobile) {
      return (
        <HorizontalScroll className="gap-2 pb-4">{movieCards}</HorizontalScroll>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {movieCards.map((card, index) => (
          <Col xs={12} sm={12} md={12} lg={6} key={index}>
            {card}
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="p-4 md:p-0">
      <div className="mb-5 flex flex-col text-center">
        <div className="mb-4 md:mb-8 text-white text-left md:text-center md:border-b-2 text-xl md:text-2xl border-white block w-max md:mx-auto md:px-8 py-4">
          {cinema.cinemaName}
        </div>
        {renderMovies()}
      </div>
    </div>
  );
};

export default LayoutCinema;
