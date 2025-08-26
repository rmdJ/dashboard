class Api::V1::SheetsController < Api::V1::BaseController
  before_action :set_sheet, only: [:show, :update, :destroy]

  # GET /api/v1/sheets
  def index
    @sheets = Sheet.recent
    render json: @sheets
  end

  # GET /api/v1/sheets/1
  def show
    render json: @sheet
  end

  # POST /api/v1/sheets
  def create
    @sheet = Sheet.new(sheet_params)

    if @sheet.save
      render json: @sheet, status: :created
    else
      render json: { errors: @sheet.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/sheets/1
  def update
    if @sheet.update(sheet_params)
      render json: @sheet
    else
      render json: { errors: @sheet.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/sheets/1
  def destroy
    @sheet.destroy
    head :no_content
  end

  private

  def set_sheet
    @sheet = Sheet.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Sheet not found' }, status: :not_found
  end

  def sheet_params
    params.require(:sheet).permit(:title, :content)
  end
end