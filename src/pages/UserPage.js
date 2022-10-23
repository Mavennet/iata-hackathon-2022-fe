import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Grid,
  Pagination,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
import ReactJson from 'react-json-view'
import axios from 'axios'
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: '', alignRight: false },
  { id: 'ourPrd', label: 'Our Product', alignRight: false },
  { id: 'benchmark', label: 'Benchmark', alignRight: false },
  { id: 'delta', label: 'Delta', alignRight: false }
];

const productionEmissions = [
  { name: 'CO2', ours: '3.1', benchmark: '4.464' },
  { name: 'CH4', ours: '0.8', benchmark: '1.1' },
  { name: 'N2O', ours: '0.02', benchmark: '0.02' },
  { name: 'Total production', ours: '3.92', benchmark: '5.584' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);

  const [order, setOrder] = useState(0);

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };


  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const fetchData = async () => {
    const response = await axios.get('http://localhost:8000/credential/', { data: { "id": "iata:Piece/KobePiece" } });
    setData(response.data);
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <Container sx={{ maxWidth: '75%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Product
        </Typography>
      </Stack>

      <Card sx={{ p: 2 }}>
        <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
        <Grid container spacing={10}>
          <Grid item xs={6}>
            <TableContainer >
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody sx={{ borderRight: '1px solid #808080', borderLeft: '1px solid #808080' }}>
                  {productionEmissions.map((row) => {
                    const { name, ours, benchmark } = row;
                    const selectedUser = selected.indexOf(name) !== -1;
                    const delta = ((benchmark - ours) / benchmark * 100).toFixed(1);
                    const isTotal = name == "Total production" && { fontWeight: 700, color: 'black ' };
                    return (
                      <TableRow hover key={name} tabIndex={-1} role="checkbox" selected={isTotal ? true : false} sx={isTotal && { borderBottom: '2px solid #808080' }}>

                        <TableCell component="th" scope="row" padding="normal" sx={{ ...isTotal }}>{name}</TableCell>

                        <TableCell align="left" padding="normal" sx={{ ...isTotal }}>{ours}</TableCell>

                        <TableCell align="left" padding="normal" sx={{ ...isTotal }}>{benchmark}</TableCell>

                        <TableCell align="left" padding="normal" sx={{ color: delta > 0 ? 'green' : delta < 0 ? 'red' : 'grey', fontWeight: isTotal && 700 }}>{`${Math.abs(delta)}%`}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow hover key={'Transport'} tabIndex={-1} role="contentinfo" selected={true} sx={{ '& > .MuiTableCell-root': { fontWeight: 700, color: 'black ' }, borderBottom: '2px solid #808080' }}>

                    <TableCell component="th" scope="row" padding="normal">{'Processing'}</TableCell>

                    <TableCell align="left" padding="normal">{0.2}</TableCell>

                    <TableCell align="left" padding="normal">{0.9}</TableCell>

                    <TableCell align="left" padding="normal" sx={{ color: 0.9 - 0.2 / 0.9 > 0 ? 'green' : 0.9 - 0.2 / 0.9 < 0 ? 'red' : 'grey' }}>{`${Math.abs(5)}%`}</TableCell>

                  </TableRow>

                  <TableRow hover key={'Transport'} tabIndex={-1} role="contentinfo" selected={true} sx={{ '& > .MuiTableCell-root': { fontWeight: 700, color: 'black ' }, borderBottom: '2px solid #808080' }}>

                    <TableCell component="th" scope="row" padding="normal">{'Transportation'}</TableCell>

                    <TableCell align="left" padding="normal">{'variable'}</TableCell>

                    <TableCell align="left" padding="normal">{'mock%'}</TableCell>

                    <TableCell align="left" padding="normal" sx={{ color: 5 > 0 ? 'green' : 5 < 0 ? 'red' : 'grey' }}>{`${Math.abs(5)}%`}</TableCell>

                  </TableRow>

                  <TableRow hover key={'Total'} tabIndex={-1} role="contentinfo" sx={{ backgroundColor: '#D0F2FF', '& > .MuiTableCell-root': { fontWeight: 700, color: 'black ' }, borderBottom: '2px solid #808080' }}>

                    <TableCell component="th" scope="row" padding="normal">{'Grand Total'}</TableCell>

                    <TableCell align="left" padding="normal">{'variable'}</TableCell>

                    <TableCell align="left" padding="normal">{'mock%'}</TableCell>

                    <TableCell align="left" padding="normal" sx={{ color: 5 > 0 ? 'green' : 5 < 0 ? 'red' : 'grey' }}>{`${Math.abs(5)}%`}</TableCell>

                  </TableRow>

                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>

          </Grid>
          <Grid item xs={6}>
            <Typography variant="h5" mb={2} align="center" gutterBottom>
              {data ? `${data[page - 1].credentialSubject?.type[0].toUpperCase() + data[page - 1].credentialSubject?.type.slice(1)} Verifiable Credential` : 'Verifiable Credential'}
            </Typography>
            <ReactJson theme={'summerfruit:inverted'} src={data && data[page - 1] ? data[page - 1] : {}} />

            <Pagination
              showFirstButton={false}
              showLastButton={false}
              count={data?.length}
              page={page}
              onChange={(event, value) => setPage(value)}
              defaultPage={1}
              size="small"
              siblingCount={2}
              boundaryCount={1}
              sx={{
                '& .MuiPagination-ul': {
                  justifyContent: 'center',
                  padding: '10px',
                  rowGap: 6,
                },
                mt: '3em',
                mb: '3em',
                textAlign: 'center',
                color: '#dc6e19',
              }}
            />
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
