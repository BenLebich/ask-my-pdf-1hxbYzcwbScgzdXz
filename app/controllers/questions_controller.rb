class QuestionsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:ask]

  def ask
    question = params[:question]

    cached_response = CachedResponse.find_by(question: question)
    if cached_response
      render json: { answer: cached_response.answer }, status: :ok
      return
    end

    embeddings_file_path = 'data/trapping-history-embeddings.csv'
    token_limit = 3400

    if question.present?
      page_embeddings = PdfToEmbeddings.load_embeddings(embeddings_file_path)
      relevant_pages = PdfToEmbeddings.find_relevant_pages(question, page_embeddings)
      prompt = PdfToEmbeddings.generate_prompt(question, relevant_pages, token_limit, embeddings_file_path)
      completion = PdfToEmbeddings.get_prompt_completion(prompt, 500)

      CachedResponse.create(question: question, answer: completion)

      render json: { answer: completion, prompt: prompt }, status: :ok
    else
      render json: { error: 'Question parameter is missing' }, status: :bad_request
    end
  end
end
