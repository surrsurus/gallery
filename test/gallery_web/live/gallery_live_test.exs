defmodule GalleryWeb.GalleryLiveTest do
  use GalleryWeb.ConnCase, async: true

  describe "GalleryLive" do
    test "can mount and start the three js scene", %{conn: conn} do
      assert {:ok, view, _html} = live(conn, "/gallery")
      assert_push_event(view, "start_scene", %{})
    end
  end
end
