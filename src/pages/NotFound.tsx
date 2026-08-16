import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Header from "../components/layout/Header";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Header title="Página não encontrada" subtitle="Erro 404" />
      <div className="mt-6">
        <EmptyState
          icon={<Compass size={22} />}
          title="Essa página não existe"
          description="O endereço acessado não corresponde a nenhuma tela do painel."
          action={
            <Link to="/">
              <Button>Voltar ao painel</Button>
            </Link>
          }
        />
      </div>
    </>
  );
}
