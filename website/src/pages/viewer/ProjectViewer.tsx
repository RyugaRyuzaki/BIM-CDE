import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import ProjectTable from "./project/ProjectTable";

const ProjectViewer = () => {
  return (
    <div className="relative h-full w-full overflow-hidden flex items-center p-5 bg-orange-300">
      <Card className="relative h-full w-full overflow-hidden shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectViewer;
