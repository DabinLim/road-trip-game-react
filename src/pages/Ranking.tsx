import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash-es';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { BestScore, requestBestScores } from '../apis/score';

export default function Ranking() {
  const [bestScores, setBestScores] = useState<BestScore[]>([]);
  useEffect(() => {
    requestBestScores().then((res) => !isEmpty(res) && setBestScores(res));
  }, []);
  return (
        <div>
            <Link to="/">
            <button type="button">
                게임하러 가기
            </button>
            </Link>
            <Table>
                <thead>
                    <tr>
                        <TableHeaderItem>
                            순위
                        </TableHeaderItem>
                        <TableHeaderItem>
                            이름
                        </TableHeaderItem>
                        <TableHeaderItem>
                            점수
                        </TableHeaderItem>
                        <TableHeaderItem>
                            달성 날짜
                        </TableHeaderItem>
                    </tr>
                </thead>
                <tbody>
            {bestScores.map((v, index) => (
                <tr key={`${v.createdAt.toMillis()}`}>
                    <TableBodyItem>{index + 1}</TableBodyItem>
                    <TableBodyItem>{v.name}</TableBodyItem>
                    <TableBodyItem>{v.score}</TableBodyItem>
                    <TableBodyItem>{dayjs(v.createdAt.toDate()).format('YY년 MM월 DD일 hh시 mm분 ss초')}</TableBodyItem>
                </tr>
            ))}
                </tbody>
            </Table>
        </div>
  );
}

const Table = styled.table`
    margin: 0 auto;
    min-width: 600px;
`;

const TableHeaderItem = styled.th`
    padding: 10px 40px;
`;
const TableBodyItem = styled.td`
    padding: 20px;
    text-align: center;
`;
