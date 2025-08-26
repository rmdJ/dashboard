class RenameFromFichesToSheets < ActiveRecord::Migration[7.2]
  def change
    rename_table :fiches, :sheets
  end
end
