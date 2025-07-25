import { Star } from "lucide-react";

export const Review = ({
  userRating,
  pressReview,
}: {
  userRating: number;
  pressReview: number;
}) =>
  Boolean(userRating) || Boolean(pressReview) ? (
    <div className="flex w-full">
      <div className="flex w-full justify-between">
        {Boolean(userRating) && (
          <div className="flex flex-col items-center gap-1">
            <div className="font-bold">Spect.</div>
            <div className="flex items-center">
              {userRating}
              <Star color="#fecc00" fill="#fecc00" size={14} className="ml-1" />
            </div>
          </div>
        )}
        {Boolean(pressReview) && (
          <div className="flex flex-col items-center gap-1">
            <div className="font-bold">Presse</div>
            <div className="flex items-center">
              {pressReview}
              <Star color="#fecc00" fill="#fecc00" size={14} className="ml-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <span className="flex text-left">
      Aucune note attribuée pour le moment.
    </span>
  );
