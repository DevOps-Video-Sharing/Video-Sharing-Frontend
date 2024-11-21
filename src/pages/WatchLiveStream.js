import React, { useState, useEffect } from "react";
import NavbarApp from "../components/NavbarApp";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { CiShare1 } from "react-icons/ci";
import CopyButton from "../components/ButtonCustom/CopyButton";
import ReactPlayer from "react-player";
import { ToastContainer, toast } from "react-toastify";

const WatchLiveStream = () => {
  const [isStreamLive, setIsStreamLive] = useState(false); // Trạng thái livestream
  const [chatMessages, setChatMessages] = useState([]); // Phải là một mảng
  const [message, setMessage] = useState(""); // Tin nhắn hiện tại
  const streamUrl = `http://192.168.120.213:13000/hls/2DEKS.m3u8`;
  const eventCode = "event123"; // Mã sự kiện mặc định

  // Kiểm tra trạng thái livestream
  const checkStreamStatus = async () => {
    try {
      const response = await fetch(streamUrl, { method: "HEAD" });
      setIsStreamLive(response.ok); // Kiểm tra nếu stream có sẵn
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái livestream:", error);
      setIsStreamLive(false);
    }
  };

  // Lấy danh sách tin nhắn từ API
  const fetchChatMessages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_CHAT}/chat/event123`);
      
      // Kiểm tra nếu không phải là JSON hợp lệ, có thể là HTML do lỗi
      const text = await response.text(); // Đọc phản hồi dưới dạng văn bản
      if (response.ok) {
        try {
          const data = JSON.parse(text); // Thử chuyển thành JSON
          if (Array.isArray(data.messages)) {
            setChatMessages(data.messages);
          } else {
            console.error("Dữ liệu messages không phải là mảng:", data.messages);
            setChatMessages([]);
          }
        } catch (error) {
          console.error("Lỗi khi phân tích JSON:", error);
          console.error("Dữ liệu trả về:", text); // In ra nội dung trả về để kiểm tra
        }
      } else {
        console.error("Lỗi khi gọi API:", response.status);
        console.error("Nội dung trả về:", text); // In ra nội dung trả về để kiểm tra
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setChatMessages([]);
    }
  };
  
  
  

  useEffect(() => {
    checkStreamStatus(); // Kiểm tra trạng thái khi tải trang
    fetchChatMessages(); // Lấy tin nhắn khi tải trang
  }, [streamUrl]);
  const username = localStorage.getItem("userName");
  // Xử lý gửi tin nhắn
  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = { username: username, message, eventCode }; // Tin nhắn mới
      try {
        const response = await fetch(`${process.env.REACT_APP_API_CHAT}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        });
        if (response.ok) {
          toast.success("Gửi tin nhắn thành công!");
          setMessage(""); // Xóa ô nhập sau khi gửi
          fetchChatMessages(); // Tải lại danh sách tin nhắn
        } else {
          toast.error("Lỗi khi gửi tin nhắn!");
          console.error("Lỗi khi gửi tin nhắn:", response.status);
        }
      } catch (error) {
        toast.error("Không thể gửi tin nhắn!");
        console.error("Lỗi khi gọi API gửi tin nhắn:", error);
      }
    }
  };

  return (
    <div className="bg-[#f0f4f9] h-screen">
      <ToastContainer position="bottom-right" />
      <NavbarApp />
      <div className="h-[60px]"></div>
      <div className="container mx-auto px-4 py-6">
        {/* Sắp xếp hàng ngang */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Video Player và chi tiết */}
          <div className="flex-1 bg-white shadow-md rounded-lg p-4">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg">
              {isStreamLive ? (
                <ReactPlayer
                  url={streamUrl}
                  playing
                  controls
                  width="100%"
                  height="100%"
                  config={{ file: { forceHLS: true } }}
                />
              ) : (
                <p className="text-center text-gray-500 py-10">
                  Chưa có livestream nào đang phát.
                </p>
              )}
            </div>

            {/* Thông tin livestream */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex space-x-4">
                <button className="flex items-center text-gray-700 hover:text-blue-600">
                  <AiOutlineLike className="mr-1" size={20} />
                  <span>Like</span>
                </button>
                <button className="flex items-center text-gray-700 hover:text-red-600">
                  <AiOutlineDislike className="mr-1" size={20} />
                  <span>Dislike</span>
                </button>
                <button className="flex items-center text-gray-700 hover:text-green-600">
                  <CiShare1 className="mr-1" size={20} />
                  <span>Share</span>
                </button>
              </div>
              <CopyButton textToCopy={streamUrl} />
            </div>
          </div>

          {/* Chat box */}
          <div className="w-full md:w-1/3 bg-white rounded-lg shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4 p-4">Trò chuyện trực tiếp</h2>

            {/* Hiển thị tin nhắn trò chuyện */}
            <div className="flex-grow overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
              {Array.isArray(chatMessages) && chatMessages.length === 0 ? (
                <p className="text-gray-500 text-center">Chưa có tin nhắn nào.</p>
              ) : (
                Array.isArray(chatMessages) && chatMessages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-sm">
                      <span className="font-semibold">{msg.username}:</span> {msg.message}
                    </p>
                    <p className="text-xs text-gray-400">{msg.timestamp}</p>
                  </div>
                ))
              )}
            </div>


            {/* Nhập và gửi tin nhắn */}
            <div className="flex items-center p-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="border rounded-lg p-2 flex-grow mr-2"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchLiveStream;
