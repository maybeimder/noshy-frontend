import { useNavigate } from "react-router-dom";
import ScreenHeader from "@/shared/components/layout/ScreenHeader";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import RoundButton from "@/shared/components/ui/RoundButton";

export default function ChefHeader({ recipeId }: { recipeId?: string | null }) {
      const navigate = useNavigate();
      return (
            <ScreenHeader
                  title="Tu chef"
                  eyebrow={recipeId ? "Hablando de esta receta" : "Conoce tu despensa y tus metas"}
                  leading={<MascotAvatar tone="blush" className="size-9" />}
                  className="sticky top-0 z-10 bg-[linear-gradient(180deg,var(--color-canvas)_82%,transparent)]"
                  actions={
                        <>
                              {recipeId && (
                                    <RoundButton label="Volver a la receta" onClick={() => navigate(`/recetas/${recipeId}`)}>
                                          <Icon name="back" />
                                    </RoundButton>
                              )}
                              <RoundButton to="/ajustes" label="Ajustes de tu chef" tone="blush">
                                    <Icon name="sliders" className="size-5" />
                              </RoundButton>
                        </>
                  }
            />
      );
}
