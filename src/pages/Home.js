import React, { useEffect, useState, useRef } from 'react';
import NavbarApp from '../components/NavbarApp';
import { IoMdMenu } from "react-icons/io";
import { LuMoveRight } from "react-icons/lu";
import VideoComponent from '../components/VideoCom/VideoComponent';
import Loading from '../components/Loading';
import LivestreamImage from '../assets/images/livestream.png'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const [videoIds, setVideoIds] = useState([]);
  const [values, setValueIds] = useState();

  const [videoUrls, setVideoUrls] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const [videoHeight, setVideoHeight] = useState('auto');

  const [urlVideo, setUrlVideo] = useState()
  const navigate = useNavigate();

  const handleLivestreamClick = (streamName) => {
    // Mở đường dẫn với tên stream hoặc ID stream, ví dụ `/watchlivestream/AGE1J`
    navigate(`/watchlivestream/${streamName}`);
  };

  // useEffect(() => {
  //   const fetchVideoIds = async () => {
  //     try {
  //       const response = await fetch('${process.env.REACT_APP_API_URL}/video/listIdThumbnail')
  //       if (response.ok) {
  //         const ids = await response.json();
  //         setVideoIds(ids);
  //       } else {
  //         console.error('Failed to fetch video ids');
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch video ids:', error);
  //     }
  //   };

  //   fetchVideoIds();
  // }, []);
  useEffect(() => {
    const fetchVideoIds = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/video/listIdThumbnail`);
        if (!response.ok) {
          throw new Error('Failed to fetch video ids');
        }
        const ids = await response.json();
        setVideoIds(ids);
        const fetchDataPromises = ids.map(async id => {
          console.log(id)
          const response = await fetch(`${process.env.REACT_APP_API_URL}/video/getDetails/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch data for id: ${id}`);
          }
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
    const video = videoRef.current;
    const resizeVideo = () => {
      if (video) {
        const videoWidth = video.clientWidth;
        const aspectRatio = video.videoWidth / video.videoHeight;
        setVideoHeight(`${videoWidth / aspectRatio}px`);
      }
    };
    window.addEventListener('resize', resizeVideo);
    resizeVideo();
    return () => {
      window.removeEventListener('resize', resizeVideo);
    };
  }, []);



  const generateThumbnailUrls = () => {
    return videoIds.map((id) => {
      return  `${process.env.REACT_APP_API_URL}/video/get/${id}`
      });
  };
  
  function getSortedIndexes(values) {
    // Kiểm tra xem values có hợp lệ không
    if (!values || values.length === 0) {
      return [];
    }
  
    // Tạo một mảng chứa các index ban đầu
    const indexes = Array.from({ length: values.length }, (_, i) => i);
  
    // Sort mảng indexes dựa trên giá trị views trong mảng values
    indexes.sort((a, b) => values[b].views - values[a].views);
  

    // Tạo một mảng chứa các index ban đầu
    const indexesSmall = Array.from({ length: values.length }, (_, i) => i);

  // Sort mảng indexes dựa trên giá trị views trong mảng values từ bé đến lớn
  indexesSmall.sort((a, b) => {
    // Lấy giá trị views và timestamp của mỗi phần tử
    const viewsA = values[a].views !== undefined ? values[a].views : 0;
    const viewsB = values[b].views !== undefined ? values[b].views : 0;
    const timestampA = values[a].metadata.timestamp;
    const timestampB = values[b].metadata.timestamp;
  
    return new Date(timestampB) - new Date(timestampA);

  //   // So sánh giá trị views
  //   if (viewsA !== viewsB) {
  //     return viewsA - viewsB;
  //   } else {
  //     // Nếu views bằng nhau, so sánh timestamps ngược lại
  //     if (timestampA && timestampB) {
  //       return new Date(timestampB) - new Date(timestampA); // Đảo ngược để timestamp mới nhất trước
  //     } else if (!timestampA && !timestampB) {
  //       // Nếu cả hai timestamp đều undefined, coi chúng là bằng nhau
  //       return 0;
  //     } else if (!timestampA) {
  //       // Nếu timestampA undefined, đặt timestampB lên trên
  //       return 1;
  //     } else {
  //       // Nếu timestampB undefined, đặt timestampA lên trên
  //       return -1;
  //     }
  //   }
  });
    const newIndexes = indexes.slice(0,4).concat(indexesSmall.slice(0, indexesSmall.length))
    return newIndexes;

  }

  const thumbnails =  generateThumbnailUrls();

  const [indexs, setIndexs] = useState([])
  useEffect(()=>{
    setIndexs( getSortedIndexes(values))
  },[values])
  const start = 4

  const [liveStreams, setLiveStreams] = useState([]);
  const [streamNames, setStreamNames] = useState([]);
  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const response = await fetch('http://192.168.120.213:13000/stat', {
          headers: {
            Accept: 'application/xml', // Yêu cầu server trả về XML
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch live streams');
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

        // Tìm tất cả các <name> trong <stream>
        const streamElements = xmlDoc.getElementsByTagName('stream');
        const names = [];
        for (let i = 0; i < streamElements.length; i++) {
          const nameElement = streamElements[i].getElementsByTagName('name')[0];
          if (nameElement) {
            names.push(nameElement.textContent);
          }
        }

        console.log('Stream names:', names);
        setStreamNames(names);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLiveStreams();
  }, []);
  const xmlToJson = (xml) => {
    const obj = {};
    if (xml.nodeType === 1) { // Element
      if (xml.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) { // Text
      obj['#text'] = xml.nodeValue.trim();
    }

    // Process child nodes
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof obj[nodeName] === 'undefined') {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  };

  return (
    <div className=''>
      <div>
        <NavbarApp />
        <div className='h-[60px]'></div>
        <div className='flex items-center my-3 pl-[20px] pt-[20px] w-3/5 text-black font-bold'>
          <IoMdMenu className='cursor-pointer size-[25px]' />
          <p className='ml-[10px] text-[#474747] text-[20px]'>Top video tiêu biểu</p>
        </div>

        <div className='flex relative  ml-2 flex-wrap'> 
        {(values && values.length > 0 && thumbnails && thumbnails.length > 0) ? (
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
            <Loading/>
          )}
          {/* <LuMoveRight className='absolute right-[-12px] border border-[#474747] top-[35%] rounded-[50%] cursor-pointer p-2 bg-[#f0f4f9] size-[50px]' /> */}
        </div>

        <div className='flex items-center mb-3 pl-[20px] pt-[20px] w-3/5 text-black font-bold'>
          <IoMdMenu className='cursor-pointer size-[25px]' />
          <p className='ml-[10px] text-[#474747] text-[20px]'>Dòng thời gian</p>
        </div>

        <div className='flex flex-wrap  ml-2'>
          {(values && values.length > 0 && thumbnails && thumbnails.length > 0) ? (
              thumbnails.slice(start).map((url, index) => (
                <VideoComponent
                  wi={405}
                  key={videoIds[indexs[index+start]]}
                  img={thumbnails[indexs[index +start]]}
                  title={values[indexs[index+start]]?.metadata?.videoName}
                  username={values[indexs[index +start]]?.metadata?.userName}
                  timestamp={values[indexs[index+start]]?.metadata?.timestamp}
                  view={values[indexs[index +start]]?.views}
                  videoId={videoIds[indexs[index +start]]}
                  userid={values[indexs[index +start]]?.metadata.userID}
                />
              ))
            ) : (
              <Loading/>
            )}
        </div>

        <div className='flex items-center mb-3 pl-[20px] pt-[20px] w-3/5 text-black font-bold'>
          <IoMdMenu className='cursor-pointer size-[25px]' />
          <p className='ml-[10px] text-[#474747] text-[20px]'>Phat truc tiep</p>
        </div>

        {/* Livestream section */}
        <div className='flex flex-wrap ml-2'>
          {streamNames.length > 0 ? (
            streamNames.map((stream, index) => (
              <Link 
                // to={`/watchlivestream/${stream.name}`}  // Thêm Link cho chuyển hướng
                to={`/watchlivestream`}  // Thêm Link cho chuyển hướng

                key={index}
                className='flex flex-col items-center justify-center border border-gray-300 rounded-lg p-4 m-2 bg-white shadow-md w-[300px] cursor-pointer'
              >
                {/* Hình ảnh cho mỗi livestream */}
                <img
                  src={LivestreamImage}
                  alt='Live Stream'
                  className='w-16 h-16 object-cover mb-4'
                />
                <p className='font-bold text-lg text-[#474747]'>{stream.name}</p>
                <p className='text-sm text-gray-500'>Clients: {stream.clients || 0}</p>
                <p className='text-sm text-gray-500'>Bandwidth In: {stream.bw_in || 0} kbps</p>
                <p className='text-sm text-gray-500'>Bandwidth Out: {stream.bw_out || 0} kbps</p>
              </Link>
            ))
          ) : (
            <Loading />
          )}
        </div>

      </div>

    </div>

  );
};

export default Home;
