import ScreenHeader from "@/shared/components/layout/ScreenHeader";
import Icon from "@/shared/components/ui/Icon";
import RoundButton from "@/shared/components/ui/RoundButton";

export default function CommunityHeader() {
      return (
            <ScreenHeader
                  title="Comunidad"
                  icon="community"
                  eyebrow="Recetas de gente real"
                  actions={
                        <RoundButton to="/recetas/nueva" label="Nueva receta" tone="primary">
                              <Icon name="plus" strokeWidth={2} />
                        </RoundButton>
                  }
            />
      );
}
