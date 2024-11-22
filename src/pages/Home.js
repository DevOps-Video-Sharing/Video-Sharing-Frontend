import React, { useEffect, useState, useRef } from 'react';
import NavbarApp from '../components/NavbarApp';
import { IoMdMenu } from "react-icons/io";
import VideoComponent from '../components/VideoCom/VideoComponent';
import Loading from '../components/Loading';
import ImageLiveStream from '../assets/images/livestream.png';
import WatchLiveStreamComponent from '../components/VideoCom/WatchLiveStreamComponent';
const Home = () => {
  const [videoIds, setVideoIds] = useState([]);
  const [values, setValueIds] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  const [livestreams, setLivestreams] = useState([]); // State lưu danh sách livestreams
  const [indexs, setIndexs] = useState([]);

  const start = 4;

  useEffect(() => {
    // Fetch video IDs and details
    const fetchVideoIds = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/video/listIdThumbnail`);
        if (!response.ok) throw new Error('Failed to fetch video ids');
        const ids = await response.json();
        setVideoIds(ids);

        const fetchDataPromises = ids.map(async id => {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/video/getDetails/${id}`);
          if (!response.ok) throw new Error(`Failed to fetch data for id: ${id}`);
          return response.json();
        });
        const data = await Promise.all(fetchDataPromises);
        setValueIds(data);
      } catch (error) {
        console.error('Failed to fetch video ids or data:', error);
      }
    };

    fetchVideoIds();
  }, []);

  useEffect(() => {
    // Fetch livestreams
    const fetchLivestreams = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_CHAT}/streams/getall`);
        if (!response.ok) throw new Error('Failed to fetch livestreams');
        const data = await response.json();
        setLivestreams(data.streams || []);
      } catch (error) {
        console.error('Failed to fetch livestreams:', error);
      }
    };

    fetchLivestreams();
  }, []);

  useEffect(() => {
    function getSortedIndexes(values) {
      if (!values || values.length === 0) return [];
      const indexes = Array.from({ length: values.length }, (_, i) => i);
      indexes.sort((a, b) => values[b].views - values[a].views);
      const indexesSmall = Array.from({ length: values.length }, (_, i) => i);
      indexesSmall.sort((a, b) => new Date(values[b].metadata.timestamp) - new Date(values[a].metadata.timestamp));
      const newIndexes = indexes.slice(0, 4).concat(indexesSmall);
      return newIndexes;
    }

    setIndexs(getSortedIndexes(values));
  }, [values]);

  const generateThumbnailUrls = () => {
    return videoIds.map((id) => `${process.env.REACT_APP_API_URL}/video/get/${id}`);
  };

  const thumbnails = generateThumbnailUrls();

  return (
    <div>
      <NavbarApp />
      <div className='h-[60px]'></div>

      <div className='flex items-center my-3 pl-[20px] pt-[20px] w-3/5 text-black font-bold'>
        <IoMdMenu className='cursor-pointer size-[25px]' />
        <p className='ml-[10px] text-[#474747] text-[20px]'>Top video tiêu biểu</p>
      </div>

      <div className='flex relative ml-2 flex-wrap'>
        {(values && thumbnails.length > 0) ? (
          thumbnails.slice(0, 4).map((url, index) => (
            <VideoComponent
              wi={405}
              key={videoIds[indexs[index]]}
              img={thumbnails[indexs[index]]}
              title={values[indexs[index]]?.metadata?.videoName}
              username={values[indexs[index]]?.metadata?.userName}
              timestamp={values[indexs[index]]?.metadata?.timestamp}
              view={values[indexs[index]]?.views}
              videoId={videoIds[indexs[index]]}
              userid={values[indexs[index]]?.metadata.userID}
            />
          ))
        ) : (
          <Loading />
        )}
      </div>

      <div className='flex items-center mb-3 pl-[20px] pt-[20px] w-3/5 text-black font-bold'>
        <IoMdMenu className='cursor-pointer size-[25px]' />
        <p className='ml-[10px] text-[#474747] text-[20px]'>Dòng thời gian</p>
      </div>

      <div className='flex flex-wrap ml-2'>
        {(values && thumbnails.length > 0) ? (
          thumbnails.slice(start).map((url, index) => (
            <VideoComponent
              wi={405}
              key={videoIds[indexs[index + start]]}
              img={thumbnails[indexs[index + start]]}
              title={values[indexs[index + start]]?.metadata?.videoName}
              username={values[indexs[index + start]]?.metadata?.userName}
              timestamp={values[indexs[index + start]]?.metadata?.timestamp}
              view={values[indexs[index + start]]?.views}
              videoId={videoIds[indexs[index + start]]}
              userid={values[indexs[index + start]]?.metadata.userID}
            />
          ))
        ) : (
          <Loading />
        )}
      </div>

      <div className='flex items-center mb-3 pl-[20px] pt-[20px] w-3/5 text-black font-bold'>
        <IoMdMenu className='cursor-pointer size-[25px]' />
        <p className='ml-[10px] text-[#474747] text-[20px]'>Phát trực tiếp</p>
      </div>

      <div className='flex flex-wrap ml-2'>
        {livestreams.length > 0 ? (
          livestreams.map((stream, index) => (
            <WatchLiveStreamComponent
              wi={405}
              key={stream.streamKey}
              img={ImageLiveStream}
              title={stream.titleLive}
              username={stream.userName}
              timestamp=""
              view=""
              streamKey={stream.streamKey}
              userid=""
            />
          ))
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default Home;
