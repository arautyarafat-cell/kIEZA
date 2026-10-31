import React from 'react';
import { Container, Card } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';

export default function Mentoria() {
  return (
    <>
      <AppNavbar />
      <Container className="py-5 text-center">
        <Card className="p-4 shadow-sm">
          <Card.Body>
            <h2 className="mb-3">Mentoria</h2>
            <p className="text-muted">
              Esta página está em desenvolvimento. Em breve terás acesso ao programa de mentoria e acompanhamento.
            </p>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
