class PdfToEmbeddings
  require 'pdf/reader'
  require 'openai'
  require 'csv'

  def initialize(file_path, output_file)
    @file_path = file_path
    @output_file = output_file
  end

  def call
    pages = extract_pages_from_pdf
    CSV.open(@output_file, "wb") do |csv|
      csv << ["page", "content", "embeddings"]
      pages.each_with_index do |page, index|
        embeddings = self.class.generate_embeddings(page)
        csv << [index + 1, page, embeddings.join(",")]
      end
    end
  end
  private

  def extract_pages_from_pdf
    pages = []
    PDF::Reader.open(@file_path) do |reader|
      reader.pages.each do |page|
        pages << page.text
      end
    end
    pages
  end

  def self.generate_embeddings(text)
    max_tokens = 7000
    embeddings = []
    start_index = 0
    
    while start_index < text.length
      substring = text[start_index, max_tokens]
  
      while OpenAI.rough_token_count(substring) > max_tokens
        substring = substring[0, substring.length - 1]
      end
  
      @client = OpenAI::Client.new(access_token: ENV['OPENAI_KEY'])
      response = @client.embeddings(parameters: {
        model: "text-embedding-ada-002",
        input: substring
      })
  
      embedding = response.dig("data", 0, "embedding")
  
      if embedding.nil?
        puts "Warning: Embeddings API call returned unexpected data: #{response}"
        start_index += substring.length
        next
      end
      
      embeddings << embedding
      
      start_index += substring.length
    end
  
    embeddings.flatten
  end

  def self.load_embeddings(file_path)
    embeddings = {}
    CSV.foreach(file_path, headers: true) do |row|
      page_number = row['page']
      embedding = row['embeddings'].split(",").map(&:to_f)
      
      if embedding.include?(nil)
        puts "Warning: Embedding for page #{page_number} contains nil values"
        next
      end
      embeddings[page_number] = embedding
    end
    embeddings
  end

  def self.find_relevant_pages(question, page_embeddings)
    query_embedding = generate_embeddings(question)
    compare_embeddings(query_embedding, page_embeddings)
  end

  def self.compare_embeddings(query_embedding, page_embeddings)
    similarities = page_embeddings.map do |page_number, page_embedding|
      similarity = dot_product(query_embedding, page_embedding)
      [similarity, page_number]
    end
    similarities.sort.reverse
  end

  def self.dot_product(a, b)
    a.zip(b).map do |x, y|
      raise "nil detected in dot_product: x=#{x}, y=#{y}" if x.nil? || y.nil?
      x * y
    end.reduce(:+)
  end

  def self.generate_prompt(question, relevant_pages, token_limit, embeddings_file_path)
    prompt = "This is the question: " + question
    prompt += "\n\nNow find the answer in the text below, keep the answers short, and concise.\n\n"
    page_contents = load_page_contents(embeddings_file_path)
  
    total_tokens = OpenAI.rough_token_count(prompt)
    
    relevant_pages.each do |similarity, page_number|
      page_content = page_contents[page_number.to_i - 1]
  
      new_prompt = prompt + "\n\n" + page_content
      new_token_count = OpenAI.rough_token_count(new_prompt)
  
      if new_token_count <= 1000
        prompt = new_prompt
        total_tokens = new_token_count
      else
        break
      end
    end
  
    prompt
  end
  
  def self.load_page_contents(embeddings_file_path)
    page_contents = []
    CSV.foreach(embeddings_file_path, headers: true) do |row|
      page_contents << row['content']
    end
    page_contents
  end

  def self.get_prompt_completion(prompt, max_tokens = 1)

    if OpenAI.rough_token_count(prompt) + max_tokens > 4097
      puts "Token limit exceeded. Reduce your prompt or completion length. #{OpenAI.rough_token_count(prompt) + max_tokens}"
      return
    end

    @client = OpenAI::Client.new(access_token: ENV['OPENAI_KEY'])
    response = @client.completions(parameters: {
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: max_tokens
    })

    puts response
    
    if response["choices"]
      completion = response["choices"].map { |c| c["text"] }.first
    else
      puts "Warning: API call returned unexpected data: #{response}"
      completion = nil
    end
  
    completion.nil? ? 'No answer found.' : completion
  end
  

end