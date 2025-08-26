class CreateFiches < ActiveRecord::Migration[7.2]
  def change
    create_table :fiches do |t|
      t.string :title, null: false
      t.text :content, null: false

      t.timestamps
    end
    
    add_index :fiches, :title
    add_index :fiches, :created_at
  end
end
