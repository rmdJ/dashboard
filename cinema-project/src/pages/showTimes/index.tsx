import { Spin, Typography, Badge, Card, Row, Col, Tag, Modal } from "antd";
import { Clock, Star, X, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchMovieShowtimes } from "@/technical/queries";
import { TimePeriod } from "../../components/ui/timePeriod";
import { useAppContext } from "../../context/appContext";
import { ShowtimesByVersion, Theater } from "@/technical/types";
import { Button } from "@/components/ui/lib/button";
const { Title, Text } = Typography;

export const Showtimes = ({
  isVisble,
  onClose,
}: {
  isVisble: boolean;
  onClose: () => void;
}) => {
  const { selectedMovie, displayedDates } = useAppContext();

  const { data: showtimesDataQuery, isLoading: isLoadingQuery } = useQuery({
    queryKey: [
      "cinemaShowtimes",
      selectedMovie?.internalId,
      displayedDates.map((date) => date.toISOString()).join(","),
    ],
    queryFn: () => {
      if (selectedMovie) {
        const dayShifts = displayedDates.map(
          (date) => date.toISOString().split("T")[0]
        );
        return fetchMovieShowtimes(
          selectedMovie.internalId,
          dayShifts,
          String(localStorage.getItem("VITE_ZIP_CODE"))
        );
      }
      return Promise.resolve(null);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!selectedMovie && displayedDates.length > 0,
  });

  return (
    <Modal
      open={isVisble}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{
        maxWidth: "96%",
        left: "2%",
        top: "2%",
        margin: 0,
        padding: 0,
        overflow: "auto",
      }}
      closable={false}
    >
      {isLoadingQuery ? (
        <div className="flex justify-center items-center min-h-screen mt-[-70px]">
          <Spin />
        </div>
      ) : (
        <>
          {selectedMovie && (
            <Card className="bg-white md:p-10 md:pt-5 relative">
              <button
                className="fixed z-10 top-5 right-5 p-4 cursor-pointer rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-all md:hidden"
                onClick={onClose}
                tabIndex={0}
              >
                <X size={16} />
              </button>

              <div className="container mx-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="mb-4 hidden md:inline-flex"
                >
                  <ArrowLeft size={16} className="mr-2" /> Revenir à la liste
                  des films
                </Button>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    {selectedMovie?.poster.url ? (
                      <img
                        alt="Affiche du film"
                        src={selectedMovie?.poster.url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex justify-center items-center relative overflow-hidden">
                        <div className="absolute w-full h-px bg-gray-400 transform rotate-45" />
                      </div>
                    )}
                  </Col>
                  <Col xs={24} md={16}>
                    <div className="flex flex-1 flex-col p-2 h-[100%]">
                      <Text
                        italic
                        style={{ fontSize: "16px", lineHeight: "1.6" }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: selectedMovie?.synopsisFull,
                          }}
                        />
                      </Text>
                      <div className="text-left flex flex-col gap-3">
                        <Text className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {selectedMovie.runtime}
                        </Text>
                        {Boolean(selectedMovie.stats.pressReview?.score) && (
                          <div className="flex flex-col">
                            <div className="font-bold">Presse :</div>
                            <div className="flex items-center">
                              <Star size={14} className="mr-1" />
                              {selectedMovie.stats.pressReview.score} / 5
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="font-bold">Spectacteurs :</div>
                          <div className="flex items-center">
                            <Star size={14} className="mr-1" />
                            {selectedMovie.stats.userRating.score} / 5
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {selectedMovie.relatedTags &&
                          selectedMovie.relatedTags.length > 0 && (
                            <>
                              {selectedMovie.relatedTags
                                .filter((tag) =>
                                  tag.name.startsWith("À partir de")
                                )
                                .map((tag, index) => (
                                  <Badge
                                    key={`${tag.name}-${index}`}
                                    count={tag.name}
                                    status="default"
                                    style={{
                                      fontSize: "13px",
                                      lineHeight: "1.6",
                                      padding: "4px 8px",
                                      height: "30px",
                                      backgroundColor: "#f0f2f5",
                                      border: "1px solid #bfbfbf",
                                      color: "#262626",
                                    }}
                                  />
                                ))}
                            </>
                          )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          )}
          <div className="container mx-auto">
            <Title className="!my-12 text-center" level={3}>
              {showtimesDataQuery && showtimesDataQuery.length > 0
                ? "Cinémas & Séances"
                : "Aucune autre séance pour ce film"}
            </Title>
            <Row gutter={[16, 16]}>
              {showtimesDataQuery?.map(
                (showtime: {
                  date: string;
                  show: {
                    theater: Theater;
                    showtimes: ShowtimesByVersion;
                  };
                }) => (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    key={showtime.show.theater.id}
                  >
                    <Card
                      title={new Date(showtime.date)
                        .toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                        .replace(/^\w/, (c) => c.toUpperCase())}
                      className="mb-4"
                      hoverable
                      onClick={() => {
                        const formattedDate = new Date(showtime.date)
                          .toISOString()
                          .split("T")[0];
                        const url = `https://www.allocine.fr/seance/film-${selectedMovie?.internalId}/pres-de-${localStorage.getItem("VITE_ZIP_CODE")}/#shwt_date=${formattedDate}`;
                        window.open(url, "_blank");
                      }}
                      style={{ borderRadius: "8px" }}
                      cover={
                        showtime.show.theater.poster?.url ? (
                          <img
                            src={showtime.show.theater.poster.url}
                            alt={`Poster de ${showtime.show.theater.name}`}
                            className="w-full h-[200px] object-contain bg-gray-200"
                          />
                        ) : (
                          <Title
                            level={4}
                            className="flex flex-row h-[200px] p-4"
                          >
                            {showtime.show.theater.name}
                          </Title>
                        )
                      }
                    >
                      <Row gutter={[16, 16]}>
                        <div className="p-4 text-left">
                          <Col span={24}>
                            <h3>{showtime.show.theater.name}</h3>
                            <h4 className="py-2">
                              {showtime.show.theater.location.city}
                            </h4>
                          </Col>
                          <Col span={24}>
                            <Title level={5}>Horaires</Title>
                            <div className="flex flex-col gap-2">
                              {Object.entries(showtime.show.showtimes)
                                .filter(([version]) => version !== "multiple")
                                .map(([version, showtimes], versionIndex) =>
                                  Array.isArray(showtimes) &&
                                  showtimes.length > 0 ? (
                                    <div
                                      key={`${showtime.show.theater.id}-${version}-${versionIndex}`}
                                      className="flex flex-wrap gap-2"
                                    >
                                      <div
                                        key={`tag-${version}-${versionIndex}`}
                                      >
                                        <Tag color="blue">
                                          {version === "dubbed" ||
                                          (selectedMovie?.languages.length ===
                                            1 &&
                                            selectedMovie.languages[0] ===
                                              "FRENCH")
                                            ? "VF"
                                            : "VO"}
                                        </Tag>
                                      </div>
                                      <div
                                        className="flex flex-wrap gap-2"
                                        key={`times-${version}-${versionIndex}`}
                                      >
                                        {showtimes.map((st) => (
                                          <TimePeriod
                                            key={`${st.internalId}-${st.startsAt}`}
                                            startsAt={st.startsAt}
                                            runtime={
                                              selectedMovie?.runtime ?? null
                                            }
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ) : null
                                )}
                            </div>
                          </Col>
                        </div>
                      </Row>
                    </Card>
                  </Col>
                )
              )}
            </Row>
          </div>
        </>
      )}
    </Modal>
  );
};
