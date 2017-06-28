class AddReferencesToTargets < ActiveRecord::Migration[5.1]
  def change
    add_reference :targets, :user, foreign_key: true
  end
end
