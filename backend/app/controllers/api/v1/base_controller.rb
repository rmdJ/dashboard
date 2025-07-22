# app/controllers/api/v1/base_controller.rb
class Api::V1::BaseController < ApplicationController
    before_action :set_default_response_format

    private

    def set_default_response_format
      request.format = :json
    end

    def render_error(message, status = :unprocessable_entity)
      render json: { error: message }, status: status
    end

    def render_success(data = {}, message = "Success")
      render json: { message: message, data: data }, status: :ok
    end
end
