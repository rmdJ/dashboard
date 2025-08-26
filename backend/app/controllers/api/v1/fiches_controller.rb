class Api::V1::FichesController < Api::V1::BaseController
  before_action :set_fiche, only: [:show, :update, :destroy]

  # GET /api/v1/fiches
  def index
    @fiches = Fiche.recent
    render json: @fiches
  end

  # GET /api/v1/fiches/1
  def show
    render json: @fiche
  end

  # POST /api/v1/fiches
  def create
    @fiche = Fiche.new(fiche_params)

    if @fiche.save
      render json: @fiche, status: :created
    else
      render json: { errors: @fiche.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/fiches/1
  def update
    if @fiche.update(fiche_params)
      render json: @fiche
    else
      render json: { errors: @fiche.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/fiches/1
  def destroy
    @fiche.destroy
    head :no_content
  end

  private

  def set_fiche
    @fiche = Fiche.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Fiche not found' }, status: :not_found
  end

  def fiche_params
    params.require(:fiche).permit(:title, :content)
  end
end