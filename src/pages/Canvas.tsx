import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import MAIN_CAR from '../images/main-car-above.png';
import CAR_ONE from '../images/car1-above.png';
import CAR_TWO from '../images/car2-above.png';
import CAR_THREE from '../images/car3-above.png';
import CAR_FOUR from '../images/car4-above.png';
import CAR_FIVE from '../images/car5-above.png';
import CAR_SIX from '../images/car6-above.png';
import CARPET_LOGO from '../images/carpet-logo.png';
import './canvas.css';
import { requestGenerateBestScore } from '../apis/score';

interface ItemPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

const W = 558;
const H = 600;
const VELOCITY = {
  mainCar: {
    left: 6,
    right: 6,
  },
  carAccel: 0.02,
};
const CAR_SCORE = 100;
const LEVEL_1_CAR_CREATE = 500;
const LEVEL_2_CAR_CREATE = 400;
const LEVEL_3_CAR_CREATE = 300;
const LEVEL_4_CAR_CREATE = 200;
const LEVEL_5_CAR_CREATE = 100;
interface PositionRef {
  cars: { position: ItemPosition, carIndex: number }[];
  carAccel: number[];
  mainCar: ItemPosition;
}

function Canvas() {
  const [name, setName] = useState('');

  const [state, setState] = useState<'play' | 'pause' | 'stop'>('stop');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [createCarTime, setCreateCarTime] = useState(LEVEL_1_CAR_CREATE);
  const [bestScore, setBestScore] = useState(0);

  const ref = useRef<HTMLCanvasElement>(null);
  const mainCarRef = useRef<HTMLImageElement>(null);
  const car1Ref = useRef<HTMLImageElement>(null);
  const car2Ref = useRef<HTMLImageElement>(null);
  const car3Ref = useRef<HTMLImageElement>(null);
  const car4Ref = useRef<HTMLImageElement>(null);
  const car5Ref = useRef<HTMLImageElement>(null);
  const car6Ref = useRef<HTMLImageElement>(null);

  const car1SizeRef = useRef({ w: 0, h: 0 });
  const car2SizeRef = useRef({ w: 0, h: 0 });
  const car3SizeRef = useRef({ w: 0, h: 0 });
  const car4SizeRef = useRef({ w: 0, h: 0 });
  const car5SizeRef = useRef({ w: 0, h: 0 });
  const car6SizeRef = useRef({ w: 0, h: 0 });
  const positionRef = useRef<PositionRef>({
    cars: [],
    carAccel: [],
    mainCar: {
      x: 0, y: 0, w: 0, h: 0,
    },
  });
  const keyRef = useRef({
    isLeft: false,
    isRight: false,
  });

  const loadImage = useCallback((src: string) => new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = src;
    img.setAttribute('style', 'border-radius: 8px; border: 1px solid black');
    img.onload = () => resolve(img);
  }), []);

  const drawImage = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, {
    x, y, w, h,
  }: ItemPosition) => {
    ctx.drawImage(img, x, y, w, h);
  }, []);

  const blockOverflowPos = useCallback((pos: ItemPosition) => {
    pos.x = pos.x + pos.w >= W ? W - pos.w : pos.x < 0 ? 0 : pos.x;
    pos.y = pos.y + pos.h >= H ? H - pos.h : pos.y < 0 ? 0 : pos.y;
  }, []);
  const updateMainCarPosition = useCallback(
    (carPosition: ItemPosition) => {
      const key = keyRef.current;
      if (key.isLeft) carPosition.x -= VELOCITY.mainCar.left;
      if (key.isRight) carPosition.x += VELOCITY.mainCar.right;
      blockOverflowPos(carPosition);
    },
    [blockOverflowPos],
  );
  const createCar = useCallback(() => {
    if (!car1Ref.current || !car2Ref.current || !car3Ref.current) return;
    const size = time === 1 || time === 0
      ? car1SizeRef.current
      : time === 2
        ? car2SizeRef.current
        : time === 3
          ? car3SizeRef.current
          : time === 4
            ? car4SizeRef.current
            : time === 5
              ? car5SizeRef.current
              : time === 6
                ? car6SizeRef.current
                : car1SizeRef.current;
    positionRef.current.cars.push({
      position: {

        x: Math.random() * (W - size.w),
        y: -size.h,
        ...size,
      },
      carIndex: time,
    });
    positionRef.current.carAccel.push(1);
  }, [time]);
  const updateCarPosition = useCallback((carPosition: ItemPosition, index: number) => {
    const { y } = carPosition;
    const accel = positionRef.current.carAccel[index];
    positionRef.current.carAccel[index] = accel + accel * VELOCITY.carAccel;
    carPosition.y = y + accel;
  }, []);
  const deleteCar = useCallback((index: number) => {
    positionRef.current.cars.splice(index, 1);
    positionRef.current.carAccel.splice(index, 1);
    setScore((n) => n + CAR_SCORE);
  }, []);
  const crashCar = useCallback(
    (carPosition: ItemPosition, index: number) => {
      const mainCarPosition = positionRef.current.mainCar;
      if (
        mainCarPosition.x + mainCarPosition.w >= carPosition.x + 15
        && mainCarPosition.x <= carPosition.x + (carPosition.w - 15)
        && mainCarPosition.y + mainCarPosition.h >= carPosition.y + 10
        && mainCarPosition.y <= carPosition.y + (carPosition.h - 10)
      ) {
        setState('stop');
        setCreateCarTime(LEVEL_1_CAR_CREATE);
        setBestScore((n) => {
          if (n < score) {
            return score;
          }
          return n;
        });
        swal.fire(`운전자가 사망하였습니다ㅋ\n점수: ${score}`).then(() => {
          setCreateCarTime(LEVEL_1_CAR_CREATE);
        });
      }
    },
    [score],
  );
  const initialGame = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, W, H);
    const { w, h } = positionRef.current.mainCar;
    positionRef.current.carAccel = [];
    positionRef.current.cars = [];
    positionRef.current.mainCar = {
      x: W / 2 - w / 2,
      y: H - h,
      w,
      h,
    };
    keyRef.current.isLeft = false;
    keyRef.current.isRight = false;
    setScore(0);
  }, []);

  useEffect(() => {
    loadImage(MAIN_CAR).then((img) => {
      (mainCarRef as any).current = img;
      const w = img.width;
      const h = img.height;
      positionRef.current.mainCar = {
        x: W / 2 - w / 2,
        y: H - h,
        w,
        h,
      };
    });
    loadImage(CAR_ONE).then((img) => {
      (car1Ref as any).current = img;
      car1SizeRef.current.w = img.width;
      car1SizeRef.current.h = img.height;
    });
    loadImage(CAR_TWO).then((img) => {
      (car2Ref as any).current = img;
      car2SizeRef.current.w = img.width;
      car2SizeRef.current.h = img.height;
    });
    loadImage(CAR_THREE).then((img) => {
      (car3Ref as any).current = img;
      car3SizeRef.current.w = img.width;
      car3SizeRef.current.h = img.height;
    });
    loadImage(CAR_FOUR).then((img) => {
      (car4Ref as any).current = img;
      car4SizeRef.current.w = img.width;
      car4SizeRef.current.h = img.height;
    });
    loadImage(CAR_FIVE).then((img) => {
      (car5Ref as any).current = img;
      car5SizeRef.current.w = img.width;
      car5SizeRef.current.h = img.height;
    });
    loadImage(CAR_SIX).then((img) => {
      (car6Ref as any).current = img;
      car6SizeRef.current.w = img.width;
      car6SizeRef.current.h = img.height;
    });
  }, []);

  useEffect(() => {
    const cvs = ref.current;
    const ctx = cvs?.getContext('2d');
    state === 'stop' && ctx && initialGame(ctx);
    if (!cvs || !ctx || state !== 'play') return;
    let rafTimer: number | undefined;
    const position = positionRef.current;
    const animate = () => {
      const mainCar = mainCarRef.current;
      const car = car1Ref.current;
      const car2 = car2Ref.current;
      const car3 = car3Ref.current;
      const car4 = car4Ref.current;
      const car5 = car5Ref.current;
      const car6 = car6Ref.current;
      ctx.clearRect(0, 0, W, H);
      if (mainCar) {
        updateMainCarPosition(position.mainCar);
        drawImage(ctx, mainCar, position.mainCar);
      }
      if (car && car2 && car3 && car4 && car5 && car6) {
        position.cars.forEach((carPosition, index) => {
          updateCarPosition(carPosition.position, index);
          switch (carPosition.carIndex) {
            case 2:
              drawImage(ctx, car2, carPosition.position);
              break;
            case 3:
              drawImage(ctx, car3, carPosition.position);
              break;
            case 4:
              drawImage(ctx, car4, carPosition.position);
              break;
            case 5:
              drawImage(ctx, car5, carPosition.position);
              break;
            case 6:
              drawImage(ctx, car6, carPosition.position);
              break;
            default:
              drawImage(ctx, car, carPosition.position);
              break;
          }
        });
        position.cars.forEach((carPosition, index) => {
          if (carPosition.position.y >= H) {
            deleteCar(index);
          } else {
            crashCar(carPosition.position, index);
          }
        });
      }
      rafTimer = requestAnimationFrame(animate);
    };
    rafTimer = requestAnimationFrame(animate);
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keyRef.current.isLeft = key === 'a' || key === 'arrowleft';
      keyRef.current.isRight = key === 'd' || key === 'arrowright';
    };
    const onKeyUp = () => {
      keyRef.current.isLeft = false;
      keyRef.current.isRight = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      rafTimer && cancelAnimationFrame(rafTimer);
      rafTimer = undefined;
    };
  }, [
    drawImage,
    loadImage,
    updateMainCarPosition,
    createCar,
    updateCarPosition,
    deleteCar,
    crashCar,
    state,
    initialGame,
  ]);

  useEffect(() => {
    let timer: number | undefined;
    timer = window.setInterval(() => {
      setTime((n) => {
        if (n === 6) {
          return 1;
        }
        return n + 1;
      });
    }, createCarTime);
    return () => {
      timer && window.clearInterval(timer);
      timer = undefined;
    };
  }, [createCarTime]);

  useEffect(() => {
    createCar();
  }, [time, createCar]);

  useEffect(() => {
    if (score === 3000) {
      setState('pause');
      swal.fire({
        title: '휴가 성공!',
        text: '휴가지에 도착했어요!\n조금 더 달려볼까요?',
        confirmButtonText: '레벨 2로 올리기',
      }).then((result) => {
        if (result.isConfirmed) {
          setCreateCarTime(LEVEL_2_CAR_CREATE);
          setState('play');
        } else {
          console.log('gggg');
          setState('stop');
          setCreateCarTime(LEVEL_1_CAR_CREATE);
        }
      });
    }
    if (score === 8000) {
      setState('pause');
      swal.fire({
        title: '휴가 성공!',
        text: '휴가지에 도착했어요!\n조금 더 달려볼까요?',
        confirmButtonText: '레벨 3로 올리기',
      }).then((result) => {
        if (result.isConfirmed) {
          setCreateCarTime(LEVEL_3_CAR_CREATE);
          setState('play');
        } else {
          setState('stop');
          setCreateCarTime(LEVEL_1_CAR_CREATE);
        }
      });
    }
    if (score === 15000) {
      setState('pause');
      swal.fire({
        title: '휴가 성공!',
        text: '휴가지에 도착했어요!\n조금 더 달려볼까요?',
        confirmButtonText: '레벨 4로 올리기',
      }).then((result) => {
        if (result.isConfirmed) {
          setCreateCarTime(LEVEL_4_CAR_CREATE);
          setState('play');
        } else {
          setState('stop');
          setCreateCarTime(LEVEL_1_CAR_CREATE);
        }
      });
    }
    if (score === 30000) {
      setState('pause');
      swal.fire({
        title: '휴가 성공!',
        text: '휴가지에 도착했어요!\n조금 더 달려볼까요?',
        confirmButtonText: '레벨 5로 올리기',
      }).then((result) => {
        if (result.isConfirmed) {
          setCreateCarTime(LEVEL_5_CAR_CREATE);
          setState('play');
        } else {
          setState('stop');
          setCreateCarTime(LEVEL_1_CAR_CREATE);
        }
      });
    }
  }, [score]);

  useEffect(() => {
    if (bestScore > 0) {
      requestGenerateBestScore({
        name,
        score: bestScore,
      });
    }
  }, [bestScore]);

  useEffect(() => {
    swal.fire({
      title: '더카펫 휴가 대작전',
      html: '더카펫 프로젝트를 마친 슬로그업 직원들은<br>즐거운 휴가를 떠나려고 합니다.<br>무사히 휴가를 갈 수 있도록 운전을 도와주세요.<br><br><span style="font-weight: 700">운전자의 이름을 입력해 주세요.</span>',
      confirmButtonText: '휴가가기',
      input: 'text',
      preConfirm(inputValue) {
        if (!inputValue) {
          swal.showValidationMessage('이름을 입력하세요.');
          return;
        }
        setName(inputValue);
      },
      allowOutsideClick: false,
    }).then(() => setState('play'));
  }, []);

  const getLevel = () => {
    switch (createCarTime) {
      case LEVEL_1_CAR_CREATE:
        return 'level 1';
      case LEVEL_2_CAR_CREATE:
        return 'level 2';
      case LEVEL_3_CAR_CREATE:
        return 'level 3';
      case LEVEL_4_CAR_CREATE:
        return 'level 4';
      case LEVEL_5_CAR_CREATE:
        return 'level 5';
      default:
        return 'level 0';
    }
  };

  return (
    <div>
      <header className="carpet-logo">
        <img src={CARPET_LOGO} alt="카펫 로고" className="carpet-logo-image" />
      </header>

      <div style={{ margin: '10px auto', textAlign: 'center' }}>
        <button type="button" onClick={() => setState('pause')}>
          일시정지
        </button>
        <button type="button" onClick={() => setState('play')}>
          시작
        </button>
        <button type="button" onClick={() => setState('stop')}>
          중지
        </button>
        <Link to="/ranking">
          <button type="button">
            순위
          </button>
        </Link>
        <p>
          이름:
          {name}
        </p>
        <p>
          현재 점수:
          {score}
        </p>
        <p>
          최고 점수:
          {bestScore}
        </p>
        <p>
          현재 레벨:
          {getLevel()}
        </p>
      </div>
      <div style={{
        position: 'relative', width: W, height: H, margin: '0 auto',
      }}
      >
        <canvas
          ref={ref}
          width={W}
          height={H}
          style={{
            display: 'block',
            margin: '0 auto',
            border: 'solid 1px black',
          }}
        />
        <div className={state === 'play' ? 'road-animation' : 'road'} />
      </div>

    </div>
  );
}

export default Canvas;
