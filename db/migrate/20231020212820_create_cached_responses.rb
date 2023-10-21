class CreateCachedResponses < ActiveRecord::Migration[7.1]
  def change
    create_table :cached_responses do |t|
      t.text :question
      t.text :answer

      t.timestamps
    end
  end
end
