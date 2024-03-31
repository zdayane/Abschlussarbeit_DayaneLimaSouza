import { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { NewsStatusEditor, NewsStatusJournalist, NewsStatusRadio, PainelResource, UserResource, UserRole } from '../BoardResources';
import { getNewsList, getUser, getUserIDFromJWT, useBoardIDContext, useUserIDContext } from '../backend/boardapi';
import Loading from './Loading';
import Collection from './NewsCollection';
import { Card } from 'react-bootstrap';
import { Cloud } from 'react-bootstrap-icons';

function TabNewsByStatus() {
  const [key, setKey] = useState<string | null>("all");
  const [news, setNews] = useState<PainelResource | null>(null);
  const { userID } = useUserIDContext();
  const { boardID, setBoardID } = useBoardIDContext();
  const [user, setUser] = useState<UserResource | null>(null);
  const [role, setUserRole] = useState<null | UserRole>(null);

  async function load() {
    try {
      const user = getUserIDFromJWT();
      if (user) {
        setUser(user);

        if (userID) {
          const myUser = await getUser(userID);
          setUser(myUser);
          setUserRole(myUser.role);
        }
      }

      if (boardID) {
        setBoardID(boardID);
        const myNews = await getNewsList(boardID);
        setNews(myNews);
      }
    } catch (err) {
      setNews(null);
    }
  }

  useEffect(() => {
    load();
  }, [userID, boardID]);

  if (!news) {
    return <Loading />;
  } else {


    return (
      <Card>
        <Card.Body>
          <Tabs
            defaultActiveKey="all"
            transition={false}
            id="noanim-tab-example"
            className="mb-3"
            justify
            onSelect={k => setKey(k)}
          >

            <Tab key="all" eventKey="all" title="All News">
              {news.board.length === 0 ? (<>
                <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Card.Body>
                    <h5>
                      <Cloud /> Empty list
                    </h5>
                  </Card.Body>
                </Card>
              </>) : (
                news.board.map(item => (
                  <div key={item.id} className="news-card">
                    <Collection key={item.id} collection={item} />
                  </div>
                ))
              )
              }
            </Tab>


            {Object.entries(
              role === UserRole.JOURNALIST ? NewsStatusJournalist
                : role === UserRole.EDITOR ? NewsStatusEditor
                  : NewsStatusRadio).map(([statusKey, statusValue]) => (
                    <Tab key={statusKey} eventKey={statusKey} title={statusValue}>
                      {news.board.filter(item => item.status === statusValue).length === 0
                        ? (<>
                          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Card.Body>
                              <h5>
                                <Cloud /> Empty list
                              </h5>
                            </Card.Body>
                          </Card>
                        </>)
                        : (
                          news.board.filter(item => item.status === statusValue).map(item => (
                            <div key={item.id} className="news-card">
                              <Collection key={item.id} collection={item} />
                            </div>
                          ))
                        )}
                    </Tab>
                  ))
            }
          </Tabs >
        </Card.Body>
      </Card>
    );
  }
}

export default TabNewsByStatus;
