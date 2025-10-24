package graph

import (
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// Client defines the graph database client interface
type Client interface {
	CreateNode(node *Node) error
	CreateEdge(edge *Edge) error
	Query(query string, params map[string]interface{}) ([]map[string]interface{}, error)
	Close() error
}

// Node represents a graph node
type Node struct {
	ID    string
	Label string
	Props map[string]interface{}
}

// Edge represents a graph edge
type Edge struct {
	FromID string
	ToID   string
	Type   string
	Props  map[string]interface{}
}

// Neo4jClient implements the Client interface for Neo4j
type Neo4jClient struct {
	driver neo4j.Driver
}

func NewNeo4jClient(url, username, password string) (*Neo4jClient, error) {
	driver, err := neo4j.NewDriver(url, neo4j.BasicAuth(username, password, ""))
	if err != nil {
		return nil, fmt.Errorf("failed to create Neo4j driver: %w", err)
	}

	return &Neo4jClient{driver: driver}, nil
}

func (c *Neo4jClient) CreateNode(node *Node) error {
	session := c.driver.NewSession(neo4j.SessionConfig{})
	defer session.Close()

	_, err := session.ExecuteWrite(func(tx neo4j.ManagedTransaction) (interface{}, error) {
		result, err := tx.Run(
			"CREATE (n:"+node.Label+" $props) RETURN n",
			map[string]interface{}{"props": node.Props},
		)
		if err != nil {
			return nil, err
		}
		return result.Consume()
	})

	return err
}

func (c *Neo4jClient) CreateEdge(edge *Edge) error {
	session := c.driver.NewSession(neo4j.SessionConfig{})
	defer session.Close()

	_, err := session.ExecuteWrite(func(tx neo4j.ManagedTransaction) (interface{}, error) {
		result, err := tx.Run(
			"MATCH (a {id: $fromId}), (b {id: $toId}) CREATE (a)-[r:"+edge.Type+" $props]->(b) RETURN r",
			map[string]interface{}{
				"fromId": edge.FromID,
				"toId":   edge.ToID,
				"props":  edge.Props,
			},
		)
		if err != nil {
			return nil, err
		}
		return result.Consume()
	})

	return err
}

func (c *Neo4jClient) Query(query string, params map[string]interface{}) ([]map[string]interface{}, error) {
	session := c.driver.NewSession(neo4j.SessionConfig{})
	defer session.Close()

	result, err := session.Run(query, params)
	if err != nil {
		return nil, err
	}

	var records []map[string]interface{}
	for result.Next() {
		records = append(records, result.Record().Values)
	}

	return records, result.Err()
}

func (c *Neo4jClient) Close() error {
	return c.driver.Close()
}

