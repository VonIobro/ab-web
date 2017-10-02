import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Container from 'components/Container';
import DiscordWidget from 'components/DiscordWidget';
import WithLoading from 'components/WithLoading';
import { TableStriped } from 'components/List';
import LobbyItem from 'containers/LobbyItem';
import LobbyMessage from 'containers/LobbyMessage';

import { fetchTableState, fetchTables } from '../../services/tableService';
import { ABI_TABLE } from '../../app.config';

import { Section } from './styles';

async function getTableData(table, action) {
  const [lineup, sb] = await Promise.all([
    table.getLineup.callPromise(),
    table.smallBlind.callPromise(),
  ]);

  action(table.address, lineup, sb);
}

const getTableHand = (tableAddr, action) => fetchTableState(tableAddr).then((rsp) => action(tableAddr, rsp));

class Lobby extends React.PureComponent {

  constructor(props) {
    super(props);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.web3 = props.web3Redux.web3;
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    this.handleRefresh();
  }

  async handleRefresh() {
    this.setState({ refreshing: true });
    try {
      const tables = await fetchTables();
      if (tables) {
        await Promise.all(tables.map((tableAddr) => {
          const contract = this.web3.eth.contract(ABI_TABLE).at(tableAddr);
          this.props.tableReceived(tableAddr);

          return Promise.all([
            getTableData(contract, this.props.lineupReceived),
            getTableHand(tableAddr, this.props.updateReceived),
          ]);
        }));
      }
    } finally {
      this.setState({ refreshing: false });
    }
  }

  render() {
    const { refreshing } = this.state;
    const { lobby } = this.props;

    return (
      <Container>
        <LobbyMessage
          bookmark="lobby-msg"
        />

        <TableStriped style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th key="number">#</th>
              <th key="blind">Blinds</th>
              <th key="play">Players </th>
              <th key="hand">Hand</th>
              <th key="actn" />
            </tr>
          </thead>
          {lobby && lobby.length > 0 && (
            <tbody>
              {lobby.map((tableAddr, i) =>
                <LobbyItem key={i} tableAddr={tableAddr} />
              )}
            </tbody>
          )}
        </TableStriped>

        <WithLoading
          isLoading={lobby.length === 0}
        />

        <Button style={{ width: '100%' }} onClick={this.handleRefresh} size="medium">
          Refresh
          <WithLoading
            isLoading={refreshing}
            loadingSize="14px"
            type="inline"
            styles={{
              inner: { marginLeft: 5 },
            }}
          />
        </Button>


        <Section>
          <DiscordWidget />
        </Section>

      </Container>
    );
  }
}

Lobby.propTypes = {
  lobby: PropTypes.array,
  web3Redux: PropTypes.any,
  tableReceived: PropTypes.func,
  updateReceived: PropTypes.func,
  lineupReceived: PropTypes.func,
};

export default Lobby;
